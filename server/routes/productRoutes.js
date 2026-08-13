const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  createProduct,
  createProductReview,
  likeProductReview,
  deleteProductReview // <--- 3. IMPORT THIS
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts) // Get All
  .post(protect, admin, createProduct); // Create New

// === REVIEW ROUTES ===
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId/like').put(protect, likeProductReview);
router.route('/:id/reviews/:reviewId').delete(protect, deleteProductReview); // <--- ADD THIS DELETE ROUTE
// =====================

router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct) // Delete
  .put(protect, admin, updateProduct); // Update

module.exports = router;