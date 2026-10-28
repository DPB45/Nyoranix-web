const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

// Business rules for shipping - kept in one place so pricing is consistent
// between what the customer sees and what actually gets charged.
const TAX_RATE = 0.18; // 18% GST
const FREE_SHIPPING_THRESHOLD = 500;
const STANDARD_SHIPPING_FEE = 50;
const EXPRESS_SHIPPING_FEE = 150;

const calcShippingPrice = (itemsPrice, shippingMethod) => {
  if (shippingMethod === 'express') return EXPRESS_SHIPPING_FEE;
  return itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Prices in the catalogue are GST-INCLUSIVE (the storefront labels them
// "Incl. GST" and the admin form derives them as excl x 1.18). So GST must not
// be added on top again: it is only the portion already inside the item total.
const gstContained = (amount) => amount - amount / (1 + TAX_RATE);
const round2 = (n) => Math.round(n * 100) / 100;

// Turns the cart sent by the browser into {productId -> quantity}
const parseCart = (orderItems, { strict }) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new HttpError(400, 'No order items');
  }
  const wanted = new Map();
  const invalid = [];
  if (orderItems.length > 100) throw new HttpError(400, 'Too many different items in one order (max 100)');
  for (const item of orderItems) {
    const id = String((item && (item.product || item.id || item._id)) || '');
    const quantity = Math.floor(Number(item && (item.quantity ?? item.qty ?? 1)));
    if (!mongoose.isValidObjectId(id)) {
      if (strict) throw new HttpError(400, 'One or more products in your cart are invalid');
      invalid.push(id);
      continue;
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 1000) {
      if (strict) throw new HttpError(400, `Invalid quantity for ${item.name || id}`);
      invalid.push(id);
      continue;
    }
    wanted.set(id, (wanted.get(id) || 0) + quantity);
  }
  return { wanted, invalid };
};

// Single source of truth for order pricing, used both for the live quote shown
// at checkout and for the order that is actually created, so the number the
// customer pays (e.g. in the UPI QR) is the number that gets charged.
//  strict:true  -> reject unknown/out-of-stock items (placing the order)
//  strict:false -> clamp to stock and report what changed (checkout quote)
const priceCart = async (orderItems, shippingMethod, { strict }) => {
  const { wanted, invalid } = parseCart(orderItems, { strict });
  const dbProducts = await Product.find({ _id: { $in: [...wanted.keys()] } })
    .select('name price countInStock'); // never load photos here (can be MBs each)

  const verifiedItems = [];
  const adjustments = [];
  let itemsPrice = 0;

  for (const [id, requested] of wanted) {
    const dbProduct = dbProducts.find((p) => p._id.toString() === id);

    if (!dbProduct) {
      if (strict) throw new HttpError(400, 'One or more products in your cart could not be found');
      adjustments.push({ id, type: 'removed', reason: 'No longer available' });
      continue;
    }

    let quantity = requested;
    if (dbProduct.countInStock < requested) {
      if (strict) {
        throw new HttpError(400, `${dbProduct.name} is out of stock (only ${dbProduct.countInStock} left)`);
      }
      quantity = dbProduct.countInStock;
      if (quantity < 1) {
        adjustments.push({ id, type: 'removed', reason: `${dbProduct.name} is out of stock` });
        continue;
      }
      adjustments.push({ id, type: 'reduced', reason: `Only ${quantity} of ${dbProduct.name} left`, quantity });
    }

    itemsPrice += dbProduct.price * quantity;
    verifiedItems.push({
      name: dbProduct.name,
      quantity,
      image: '', // see models/order.js - the UI resolves the picture from the product id
      price: dbProduct.price, // authoritative DB price, never the client's
      product: dbProduct._id,
      countInStock: dbProduct.countInStock,
    });
  }

  invalid.forEach((id) => adjustments.push({ id, type: 'removed', reason: 'Invalid item' }));

  const method = shippingMethod === 'express' ? 'express' : 'standard';
  const shippingPrice = verifiedItems.length ? calcShippingPrice(itemsPrice, method) : 0;
  const taxPrice = gstContained(itemsPrice);
  const totalPrice = itemsPrice + shippingPrice; // GST already inside itemsPrice

  return {
    verifiedItems,
    adjustments,
    itemsPrice: round2(itemsPrice),
    shippingPrice: round2(shippingPrice),
    taxPrice: round2(taxPrice),
    totalPrice: round2(totalPrice),
  };
};

// @desc    Live price quote for the cart (current DB prices, stock-clamped)
// @route   POST /api/orders/quote
// @access  Private
const getOrderQuote = async (req, res) => {
  try {
    const q = await priceCart(req.body.orderItems, req.body.shippingMethod, { strict: false });
    res.json({
      items: q.verifiedItems.map((i) => ({
        id: String(i.product), name: i.name, price: i.price, quantity: i.quantity, countInStock: i.countInStock,
      })),
      adjustments: q.adjustments,
      itemsPrice: q.itemsPrice,
      shippingPrice: q.shippingPrice,
      taxPrice: q.taxPrice,
      totalPrice: q.totalPrice,
      taxIncluded: true,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Could not calculate price' });
  }
};

const ALLOWED_PAYMENT_METHODS = ['Cash on Delivery', 'Online'];
const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// One order at a time per account (per server instance). The "max open orders" count is
// read-then-write, so 60 parallel requests could all pass it before any was saved.
const ordersInFlight = new Set();
const addOrderItems = async (req, res) => {
  const uid = String(req.user._id);
  if (ordersInFlight.has(uid)) {
    return res.status(429).json({ message: 'Your previous order is still being processed. Please wait a moment.' });
  }
  ordersInFlight.add(uid);
  try {
    await placeOrder(req, res);
  } finally {
    ordersInFlight.delete(uid);
  }
};

const placeOrder = async (req, res) => {
  try {
    const { orderItems, shippingMethod } = req.body;
    const paymentMethod = req.body.paymentMethod;
    // Apps show the UTR in many shapes ("4567 8901 2345", "UPI/123456789012", "Ref No: 1234...").
    // Reduce it to ONE canonical form: if a standalone 12-digit number is present (that is what a
    // UPI UTR is) it IS the reference, otherwise the cleaned text. Decorating the same payment
    // ("UPI/...", "REF...", "...-") therefore cannot make it look like a different one.
    const cleanedRef = str(req.body.paymentReference, 80).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const core = cleanedRef.match(/(?:^|\D)(\d{12})(?!\d)/);
    const paymentReference = core ? core[1] : cleanedRef;
    const sa = req.body.shippingAddress || {};

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      throw new HttpError(400, 'Invalid payment method');
    }
    if (paymentMethod === 'Online' && !paymentReference) {
      throw new HttpError(400, 'Please enter the UPI transaction ID / UTR number after paying');
    }

    const shippingAddress = {
      fullName: str(sa.fullName, 120),
      address: str(sa.address, 400),
      city: str(sa.city, 100),
      postalCode: str(sa.postalCode, 12),
      country: str(sa.country, 60) || 'India',
      mobile: str(sa.mobile, 20),
    };
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city
        || !shippingAddress.postalCode || !shippingAddress.mobile) {
      throw new HttpError(400, 'Please complete the shipping address');
    }
    // The browser checks these too, but the server must not rely on that
    if (!/^\d{6}$/.test(shippingAddress.postalCode)) throw new HttpError(400, 'Enter a valid 6-digit PIN code');
    let mobile = shippingAddress.mobile.replace(/\D/g, '');
    if (mobile.length === 12 && mobile.startsWith('91')) mobile = mobile.slice(2);
    else if (mobile.length === 11 && mobile.startsWith('0')) mobile = mobile.slice(1);
    if (!/^[6-9]\d{9}$/.test(mobile)) throw new HttpError(400, 'Enter a valid 10-digit mobile number');
    shippingAddress.mobile = mobile;
    if (paymentMethod === 'Online' && !(/^[A-Z0-9_-]{6,40}$/.test(paymentReference) && new Set(paymentReference.replace(/[-_]/g, '')).size >= 4)) {
      // also rejects junk like 000000, AAAAAA or ------
      throw new HttpError(400, 'The UPI transaction ID / UTR looks wrong - copy it from your UPI app (at least 6 characters, not repeated)');
    }

    // One account must not be able to tie up all your stock (or fill the database) with
    // unpaid orders: cap how many can be open (not delivered, not cancelled) at once.
    const openLimit = Number(process.env.MAX_OPEN_ORDERS) || 5;
    const openOrders = await Order.countDocuments({ user: req.user._id, isCancelled: { $ne: true }, isDelivered: false });
    if (openOrders >= openLimit) {
      throw new HttpError(429, `You already have ${openOrders} open orders. Please wait for them to be delivered (or contact support) before placing another.`);
    }

    // The same UPI transaction ID must not pay for two different orders
    if (paymentMethod === 'Online') {
      const reused = await Order.exists({ paymentReference, isCancelled: { $ne: true } });
      if (reused) {
        throw new HttpError(400, 'This UPI transaction ID has already been used for another order');
      }
    }

    // Rebuild every line item and total from the DATABASE - never trust price,
    // name or image sent from the browser for money math.
    const priced = await priceCart(orderItems, shippingMethod, { strict: true });
    const verifiedItems = priced.verifiedItems.map(({ countInStock, ...line }) => line);

    const order = new Order({
      orderItems: verifiedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      paymentReference: paymentMethod === 'Online' ? paymentReference : undefined,
      itemsPrice: priced.itemsPrice,
      shippingPrice: priced.shippingPrice,
      taxPrice: priced.taxPrice,
      taxIncluded: true,
      totalPrice: priced.totalPrice,
    });

    // === Atomically reserve stock for every item before creating the order ===
    // A plain stock check reads a snapshot that can go stale: if two customers
    // check out the last unit at nearly the same time, both checks could pass.
    // A conditional filter (only decrement if enough stock still exists) makes
    // each reservation atomic. If any reservation fails, roll back the earlier
    // ones so stock stays accurate and no order is created.
    const reserved = [];
    let stockError = null;

    for (const item of verifiedItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, countInStock: { $gte: item.quantity } },
        { $inc: { countInStock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        stockError = `${item.name} just went out of stock - please update your cart`;
        break;
      }
      reserved.push(item);
    }

    if (stockError) {
      await Promise.all(
        reserved.map((item) =>
          Product.updateOne({ _id: item.product }, { $inc: { countInStock: item.quantity } })
        )
      );
      return res.status(409).json({ message: stockError });
    }

    let createdOrder;
    try {
      createdOrder = await order.save();
    } catch (saveError) {
      // Order failed to save after stock was already reserved - give it back
      await Promise.all(
        verifiedItems.map((item) =>
          Product.updateOne({ _id: item.product }, { $inc: { countInStock: item.quantity } })
        )
      );
      if (saveError && saveError.code === 11000) {
        // Lost the race against another order using the same UPI transaction ID
        throw new HttpError(400, 'This UPI transaction ID has already been used for another order');
      }
      throw saveError;
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order Creation Failed:', error.message);
    const status = error.status || 500;
    res.status(status).json({ message: error.status ? error.message : 'Could not place your order. Please try again.' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    // Populate attaches the user's name and email to the order data
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // A customer may only view their own order; admins can view any order.
    // Without this check, any logged-in user could view another customer's
    // full order - shipping address, phone, items, payment reference - just
    // by knowing or guessing the order ID.
    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).select('-orderItems.image');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).select('-orderItems.image').populate('user', 'id name email');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Give a cancelled order's stock back, one line at a time. Each line is flagged
// `restocked` BEFORE its stock is added (so a retry can never add it twice) and the
// flag is rolled back if the stock update itself fails (so a retry will redo it).
const restockOrderItems = async (order) => {
  for (const item of order.orderItems) {
    const flipped = await Order.updateOne(
      { _id: order._id, orderItems: { $elemMatch: { _id: item._id, restocked: { $ne: true } } } },
      { $set: { 'orderItems.$.restocked': true } }
    );
    if (!flipped.modifiedCount) continue; // already restocked
    try {
      await Product.updateOne({ _id: item.product }, { $inc: { countInStock: item.quantity } });
    } catch (err) {
      await Order.updateOne({ _id: order._id, 'orderItems._id': item._id }, { $set: { 'orderItems.$.restocked': false } });
      throw err;
    }
  }
};

// Cancel an order and return its stock. The conditional filter makes this safe
// to call twice, or from the admin button and the auto-cancel job at the same
// moment: only the call that flips isCancelled false -> true proceeds.
// requireUnpaid: used by the auto-cancel job so it can never cancel an order an
// admin has just verified and marked as paid.
const cancelAndRestock = async (orderId, reason, { requireUnpaid = false } = {}) => {
  const filter = { _id: orderId, isCancelled: { $ne: true }, isDelivered: false };
  if (requireUnpaid) filter.isPaid = false;

  const order = await Order.findOneAndUpdate(
    filter,
    { $set: { isCancelled: true, cancelledAt: new Date(), cancelReason: reason } },
    { new: true }
  );
  if (!order) return null;
  await restockOrderItems(order);
  return order;
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.isCancelled) return res.status(400).json({ message: 'This order was cancelled' });
    if (order.isDelivered) return res.status(400).json({ message: 'This order is already delivered' });
    // A UPI order must have its payment verified before it is sent out
    if (order.paymentMethod === 'Online' && !order.isPaid) {
      return res.status(400).json({ message: 'Verify the UPI payment (Mark Paid) before delivering this order' });
    }

    const now = Date.now();
    const set = { isDelivered: true, deliveredAt: now };
    // Cash on Delivery: the cash is collected at the door, so the order is paid now
    if (order.paymentMethod === 'Cash on Delivery' && !order.isPaid) {
      set.isPaid = true;
      set.paidAt = now;
      set.paymentResult = { id: 'cod-collected', status: 'COMPLETED', update_time: new Date(now).toISOString(), email_address: req.user.email };
    }

    // Conditional write: if the order was cancelled (or delivered) in the meantime
    // this matches nothing, so a cancelled order can never end up delivered.
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, isCancelled: { $ne: true }, isDelivered: false },
      { $set: set },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: 'The order changed (cancelled or delivered). Refresh and check its status.' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark order as paid (manual verification of a UPI/QR payment
//          against the reference number the customer entered, until a real
//          payment gateway is wired up)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.isCancelled) return res.status(400).json({ message: 'This order was cancelled' });
    if (order.isPaid) return res.status(400).json({ message: 'This order is already marked as paid' });

    const now = Date.now();
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, isCancelled: { $ne: true }, isPaid: false },
      {
        $set: {
          isPaid: true,
          paidAt: now,
          paymentResult: {
            id: order.paymentReference || 'manual-verification',
            status: 'COMPLETED',
            update_time: new Date(now).toISOString(),
            email_address: req.user.email,
          },
        },
      },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: 'The order changed (cancelled or already paid). Refresh and check its status.' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel an order and put its items back in stock
// @route   PUT /api/orders/:id/cancel
// @access  Private/Admin
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.isDelivered) return res.status(400).json({ message: 'A delivered order cannot be cancelled' });
    if (order.isCancelled) return res.status(400).json({ message: 'This order is already cancelled' });

    const reason = (typeof req.body.reason === 'string' && req.body.reason.trim().slice(0, 200)) || 'Cancelled by admin';
    const cancelled = await cancelAndRestock(order._id, reason);
    if (!cancelled) return res.status(409).json({ message: 'Order could not be cancelled (it just changed). Refresh and try again.' });
    res.json(cancelled);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Unpaid UPI orders reserve stock but may never be paid. Cancel them after a
// while so the stock goes back on sale. AUTO_CANCEL_UNPAID_HOURS=0 disables it.
// (Runs inside the server process: on a sleeping free instance it simply runs
// the next time the server wakes up.)
const startAutoCancelJob = () => {
  const hours = Number(process.env.AUTO_CANCEL_UNPAID_HOURS ?? 48);
  if (!(hours > 0)) return;

  const run = async () => {
    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      const stale = await Order.find({
        paymentMethod: 'Online', isPaid: false, isCancelled: { $ne: true }, isDelivered: false, createdAt: { $lt: cutoff },
      }).select('_id');
      for (const o of stale) {
        await cancelAndRestock(o._id, `Auto-cancelled: payment not received within ${hours} hours`, { requireUnpaid: true });
      }

      // Retry cancellations whose stock return failed part-way (a DB error mid-restock)
      const unfinished = await Order.find({ isCancelled: true, orderItems: { $elemMatch: { restocked: false } } });
      for (const o of unfinished) await restockOrderItems(o);
      if (stale.length) console.log(`Auto-cancelled ${stale.length} unpaid order(s)`);
    } catch (err) {
      console.error('Auto-cancel job failed:', err.message);
    }
  };
  setTimeout(run, 30 * 1000);
  const timer = setInterval(run, 60 * 60 * 1000);
  if (timer.unref) timer.unref();
};

module.exports = {
  addOrderItems,
  getOrderQuote,
  getOrderById, // <--- This was missing
  getMyOrders,
  getOrders,
  updateOrderToDelivered, // <--- Added for Admin Panel
  updateOrderToPaid,
  cancelOrder,
  startAutoCancelJob,
  restockOrderItems,
};