const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    resendOtp,
    verifyEmail, // <--- 1. IMPORT THIS
    forgotPassword,
    resetPassword,
    updateUserProfile,
    addUserAddress,
    deleteUserAddress,
    getUsers,
    deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(registerUser)
    .get(protect, admin, getUsers);

// === 2. ADD VERIFY ROUTE HERE ===
router.post('/verify', verifyEmail);
router.post('/resend-otp', resendOtp);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/login', authUser);
router.route('/profile').put(protect, updateUserProfile);
router.route('/address').post(protect, addUserAddress);
router.route('/address/:addressId').delete(protect, deleteUserAddress);

router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;