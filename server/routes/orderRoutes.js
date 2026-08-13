const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrders,
  getMyOrders,
  getOrderById, // <--- 1. IMPORT THIS
  updateOrderToDelivered,
  updateOrderToPaid
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

// === 2. ADD THIS MISSING ROUTE ===
router.route('/:id').get(protect, getOrderById);
// ================================

// Admin route to mark as delivered
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
// Admin route to mark as paid (manual UPI verification)
router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

module.exports = router;