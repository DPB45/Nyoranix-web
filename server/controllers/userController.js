const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check if user exists, password matches, AND is verified
    if (user && (await user.matchPassword(password))) {
        if (user.isVerified === false) {
             // Optional: Handle unverified users trying to login (or let them login if logic allows)
             // For strict OTP flow, you might want to return an error here, but standard authUser is kept simple.
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user & Send OTP
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    // A verified user with this email already exists -> real conflict.
    if (existingUser && existingUser.isVerified) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // 1. Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

    let user;
    try {
        if (existingUser && !existingUser.isVerified) {
            // They started registering before but never verified (e.g. the
            // first OTP email never arrived, or they're hitting "Resend").
            // Update their details/password and re-send a fresh OTP instead
            // of blocking them with "User already exists".
            existingUser.name = name;
            existingUser.password = password; // re-hashed by the pre-save hook
            existingUser.otp = otp;
            existingUser.otpExpires = otpExpires;
            user = await existingUser.save();
        } else {
            // 2. Create User (Unverified)
            user = await User.create({
                name,
                email,
                password,
                otp,
                otpExpires,
                isVerified: false
            });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid user data' });
        return;
    }

    // 3. Send Email
    try {
        await sendOtpEmail(email, otp, 'verify');
        res.status(201).json({
            message: "OTP sent to your email. Please verify.",
            email: user.email
        });
    } catch (error) {
        // Only delete the user if this was a brand-new signup - don't wipe
        // out an existing unverified account just because this particular
        // resend failed.
        if (!existingUser) {
            await User.deleteOne({ _id: user._id });
        }
        console.error('Failed to send OTP email:', error);
        res.status(500).json({ message: 'Email could not be sent. Please check if the email is valid, or try again in a moment.' });
    }
};

// @desc    Resend OTP for an unverified account
// @route   POST /api/users/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({ message: 'No pending registration found for this email.' });
        return;
    }
    if (user.isVerified) {
        res.status(400).json({ message: 'This email is already verified. Please log in.' });
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
        await sendOtpEmail(email, otp, 'verify');
        res.json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        console.error('Failed to resend OTP email:', error);
        res.status(500).json({ message: 'Email could not be sent. Please try again in a moment.' });
    }
};

// @desc    Verify OTP
// @route   POST /api/users/verify
// @access  Public
const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (user && user.otp === otp && user.otpExpires > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid or Expired OTP' });
    }
};

// @desc    Request a password reset OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({ message: 'No account found with that email address.' });
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
        await sendOtpEmail(email, otp, 'reset');
        res.json({ message: 'A password reset code has been sent to your email.' });
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        res.status(500).json({ message: 'Email could not be sent. Please try again in a moment.' });
    }
};

// @desc    Reset password using the emailed OTP
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });

    if (
        !user ||
        !user.resetOtp ||
        user.resetOtp !== otp ||
        !user.resetOtpExpires ||
        user.resetOtpExpires < Date.now()
    ) {
        res.status(400).json({ message: 'Invalid or expired code. Please request a new one.' });
        return;
    }

    user.password = password; // re-hashed by the pre-save hook
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
    });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Optional: Prevent deleting admin users to avoid lockout
            if (user.isAdmin) {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }

            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    authUser,
    registerUser,
    resendOtp,
    verifyEmail, // <--- Added Export
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser
};