const mongoose = require('mongoose');

const inquirySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true // Adds createdAt time automatically
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;