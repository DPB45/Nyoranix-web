const Inquiry = require('../models/Inquiry');
const { sendInquiryNotification } = require('../utils/sendEmail');

// @desc    Create new inquiry (Contact Us form)
// @route   POST /api/inquiry
// @access  Public
const createInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      subject,
      message,
    });

    // Fire off the admin notification email. We don't want a slow/failed
    // email to block the customer's response, so this is awaited but any
    // error inside it is already caught internally in sendEmail.js.
    sendInquiryNotification(inquiry);

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not send message' });
  }
};

// @desc    Get all inquiries (for Admin Panel > Messages)
// @route   GET /api/inquiry
// @access  Private/Admin
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not fetch messages' });
  }
};

// @desc    Mark an inquiry as read
// @route   PUT /api/inquiry/:id/read
// @access  Private/Admin
const markInquiryRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Message not found' });
    }
    inquiry.isRead = true;
    await inquiry.save();
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not update message' });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/inquiry/:id
// @access  Private/Admin
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Message not found' });
    }
    await inquiry.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not delete message' });
  }
};

module.exports = { createInquiry, getInquiries, markInquiryRead, deleteInquiry };