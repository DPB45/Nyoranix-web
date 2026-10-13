const express = require('express');
const router = express.Router();
const { validateIdParam } = require('../utils/security');
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

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/quote').post(protect, getOrderQuote);

// === 2. ADD THIS MISSING ROUTE ===
router.route('/:id').get(protect, getOrderById);
// ================================

// Admin route to mark as delivered
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
// Admin route to mark as paid (manual UPI verification)
router.route('/:id/cancel').put(protect, admin, cancelOrder);
router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

module.exports = router;