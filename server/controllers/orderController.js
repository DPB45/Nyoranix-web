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

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, shippingMethod, paymentReference } = req.body;

    if (paymentMethod === 'Online' && (!paymentReference || !paymentReference.trim())) {
      res.status(400);
      throw new Error('Please enter the UPI transaction ID / UTR number after paying');
    }

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // === Look up every product referenced in the cart in one query ===
    const productIds = orderItems.map((x) => x.product || x.id || x._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== new Set(productIds.map(String)).size) {
      res.status(400);
      throw new Error('One or more products in your cart could not be found');
    }

    // === Rebuild each line item using the REAL price/stock from the database ===
    // Never trust price, name, or image sent from the browser for money math -
    // a tampered request could otherwise pay whatever price it likes.
    let itemsPrice = 0;
    const verifiedItems = orderItems.map((item) => {
      const productId = item.product || item.id || item._id;
      const dbProduct = dbProducts.find((p) => p._id.toString() === String(productId));

      if (!dbProduct) {
        res.status(400);
        throw new Error(`Product not found: ${item.name || productId}`);
      }

      const quantity = Number(item.quantity || item.qty || 1);

      if (quantity < 1) {
        res.status(400);
        throw new Error(`Invalid quantity for ${dbProduct.name}`);
      }

      if (dbProduct.countInStock < quantity) {
        res.status(400);
        throw new Error(`${dbProduct.name} is out of stock (only ${dbProduct.countInStock} left)`);
      }

      itemsPrice += dbProduct.price * quantity;

      return {
        name: dbProduct.name,
        quantity,
        image: dbProduct.images?.[0] || dbProduct.image,
        price: dbProduct.price, // authoritative DB price, not whatever the client sent
        product: dbProduct._id,
      };
    });

    const shippingPrice = calcShippingPrice(itemsPrice, shippingMethod);
    const taxPrice = itemsPrice * TAX_RATE;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const round2 = (n) => Math.round(n * 100) / 100;

    const order = new Order({
      orderItems: verifiedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      paymentReference: paymentMethod === 'Online' ? paymentReference.trim() : undefined,
      itemsPrice: round2(itemsPrice),
      shippingPrice: round2(shippingPrice),
      taxPrice: round2(taxPrice),
      totalPrice: round2(totalPrice),
    });

    // Decrement stock now that the order is confirmed
    await Promise.all(
      verifiedItems.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.quantity } })
      )
    );

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order Creation Failed:", error.message);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({ message: error.message });
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
    const orders = await Order.find({ user: req.user._id });
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
    const orders = await Order.find({}).populate('user', 'id name');
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
  getOrderById, // <--- This was missing
  getMyOrders,
  getOrders,
  updateOrderToDelivered, // <--- Added for Admin Panel
  updateOrderToPaid,
};