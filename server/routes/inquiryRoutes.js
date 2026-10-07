const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  markInquiryRead,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { protect, admin } = require('../middleware/authMiddleware');
const { createLimiter } = require('../utils/security');

// Public contact form: cap per IP so it can't be used to flood the inbox/DB
const inquiryLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many messages sent. Please try again later.' });

router.route('/')
  .post(inquiryLimiter, createInquiry)
  .get(protect, admin, getInquiries);

router.route('/:id')
  .delete(protect, admin, deleteInquiry);

router.route('/:id/read')
  .put(protect, admin, markInquiryRead);

module.exports = router;