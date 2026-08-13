const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    verifyEmail, // <--- 1. IMPORT THIS
    updateUserProfile,
    getUsers,
    deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(registerUser)
    .get(protect, admin, getUsers);

// === 2. ADD VERIFY ROUTE HERE ===
router.post('/verify', verifyEmail);

router.post('/login', authUser);
router.route('/profile').put(protect, updateUserProfile);

router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;