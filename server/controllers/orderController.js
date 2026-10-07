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
  for (const item of orderItems.slice(0, 100)) {
    const id = String((item && (item.product || item.id || item._id)) || '');
    const quantity = Math.floor(Number(item && (item.quantity || item.qty || 1)));
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
    .select('name price countInStock image images');

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
      image: dbProduct.images?.[0] || dbProduct.image,
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
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingMethod } = req.body;
    const paymentMethod = req.body.paymentMethod;
    const paymentReference = str(req.body.paymentReference, 60);
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: order.paymentReference || 'manual-verification',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderQuote,
  getOrderById, // <--- This was missing
  getMyOrders,
  getOrders,
  updateOrderToDelivered, // <--- Added for Admin Panel
  updateOrderToPaid,
};