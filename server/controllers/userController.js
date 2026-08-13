const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// === 1. IMPORT NODEMAILER ===
const nodemailer = require('nodemailer');
// const sendWelcomeEmail = require('../utils/sendEmail'); // (Optional: Unused in OTP flow)

// Configure Nodemailer (Use your credentials)
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 2525,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.BREVO_LOGIN,
        pass: process.env.BREVO_SMTP_KEY,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
});

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
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // 1. Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

    // 2. Create User (Unverified)
    const user = await User.create({
        name,
        email,
        password,
        otp,
        otpExpires,
        isVerified: false
    });

    if (user) {
        // 3. Send Email
     const mailOptions = {
         from: `"Nyoranix Support" <${process.env.BREVO_LOGIN}>`,
         to: email,
         subject: "Verify your email - Nyoranix",
         text: `Your verification code is: ${otp}`,
     };

        try {
            await transporter.sendMail(mailOptions);
            res.status(201).json({
                message: "OTP sent to your email. Please verify.",
                email: user.email
            });
        } catch (error) {
            // If email fails to send, delete the user so they can try again
            await User.deleteOne({ _id: user._id });
            console.error(error);
            res.status(500).json({ message: 'Email could not be sent. Please check if the email is valid.' });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
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
    verifyEmail, // <--- Added Export
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser
};