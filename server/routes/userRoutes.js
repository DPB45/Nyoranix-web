const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    resendOtp,
    verifyEmail, // <--- 1. IMPORT THIS
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    addUserAddress,
    deleteUserAddress,
    getUsers,
    deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { createLimiter, ipEmailKey } = require('../utils/security');

// Brute-force / abuse protection (per IP + email). In-memory: fine for one instance.
const loginLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyFn: ipEmailKey, message: 'Too many login attempts. Please try again in 15 minutes.' });
const otpLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 10, keyFn: ipEmailKey, message: 'Too many attempts. Please wait a few minutes and try again.' });
const mailLimiter = createLimiter({ windowMs: 10 * 60 * 1000, max: 4, keyFn: ipEmailKey, message: 'Too many code requests. Please wait 10 minutes before trying again.' });
const registerLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many sign-up attempts from this network. Please try again later.' });

router.route('/')
    .post(registerLimiter, mailLimiter, registerUser)
    .get(protect, admin, getUsers);

// === 2. ADD VERIFY ROUTE HERE ===
router.post('/verify', otpLimiter, verifyEmail);
router.post('/resend-otp', mailLimiter, resendOtp);

router.post('/forgot-password', mailLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);

router.post('/login', loginLimiter, authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/address').post(protect, addUserAddress);
router.route('/address/:addressId').delete(protect, deleteUserAddress);

router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;