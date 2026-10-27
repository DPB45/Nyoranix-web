const express = require('express');
const router = express.Router();
const { validateIdParam, createLimiter } = require('../utils/security');
const {
  addOrderItems,
  getOrderQuote,
  cancelOrder,
  getOrders,
  getMyOrders,
  getOrderById, // <--- 1. IMPORT THIS
  updateOrderToDelivered,
  updateOrderToPaid
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.param('id', validateIdParam);

// Per-ACCOUNT limits (these routes are behind protect, so req.user exists).
// quote: cheap but queries up to 100 products; orders: reserve real stock.
const perUser = (req) => String(req.user._id);
const quoteLimiter = createLimiter({ windowMs: 10 * 60 * 1000, max: 120, keyFn: perUser, message: 'Too many price checks. Please wait a few minutes.' });
const orderLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 15, keyFn: perUser, message: 'Too many orders from this account. Please try again later.' });

router.route('/')
    .post(protect, orderLimiter, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/quote').post(protect, quoteLimiter, getOrderQuote);

// === 2. ADD THIS MISSING ROUTE ===
router.route('/:id').get(protect, getOrderById);
// ================================

// Admin route to mark as delivered
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
// Admin route to mark as paid (manual UPI verification)
router.route('/:id/cancel').put(protect, admin, cancelOrder);
router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

module.exports = router;