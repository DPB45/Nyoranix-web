const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { sendOtpEmail, sendWelcomeEmail } = require('../utils/sendEmail');
const { generateOtp, toStr, normalizeEmail, isEmail } = require('../utils/security');

const MAX_OTP_ATTEMPTS = 5;
const MIN_PASSWORD = 6;

// A code was issued less than a minute ago (the code lives 10 min, so issued-at = expires - 10 min).
// Used to stop "Resend" being spammed: each resend resets the guess budget and mails the owner.
const issuedRecently = (expires) => !!expires && new Date(expires).getTime() - 10 * 60 * 1000 > Date.now() - 60 * 1000;

// Keeps the response time of "unknown email" close to "real account" (which does one
// database write) so timing can't be used to find out which emails are registered.
// The filter matches nothing, so it changes no data.
const dummyWrite = () => User.updateOne({ _id: null }, { $set: { resetOtpAttempts: 0 } }).catch(() => {});

// Case-insensitive lookup so accounts created before emails were lower-cased
// ("Rahul@Gmail.com") can still log in with any casing.
const findByEmail = (email) => User.findOne({ email }).collation({ locale: 'en', strength: 2 });

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
    try {
        const email = normalizeEmail(req.body.email);
        const password = toStr(req.body.password, 200);
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await findByEmail(email);

        // Check if user exists, password matches, AND is verified
        if (user && (await user.matchPassword(password))) {
            if (user.isVerified === false) {
                return res.status(403).json({
                    message: 'Please verify your email before logging in. Check your inbox for the OTP, or register again to get a new code.'
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                mobile: user.mobile,
                addresses: user.addresses,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Register a new user & Send OTP
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const name = toStr(req.body.name, 100);
    const email = normalizeEmail(req.body.email);
    const password = toStr(req.body.password, 200);

    if (!name || !isEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid name and email address' });
    }
    if (password.length < MIN_PASSWORD) {
        return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
    }

    let existingUser;
    try {
        existingUser = await findByEmail(email);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }

    // A verified user with this email already exists -> real conflict.
    if (existingUser && existingUser.isVerified) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // 1. Generate 6 digit OTP (cryptographically secure)
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes

    let user;
    try {
        if (existingUser && !existingUser.isVerified) {
            // They started registering before but never verified (e.g. the first OTP
            // email never arrived). Only re-send a fresh OTP.
            //
            // SECURITY: do NOT change the password or name here. The code goes to the real
            // owner of the email, so if re-registering overwrote the password, an attacker
            // could register a victim's email first with the attacker's password; the victim
            // then verifies with the newest code and the attacker's password works.
            // (Someone who typed a different password the first time can use "Forgot password":
            // proving they own the email by code also verifies the account.)
            if (issuedRecently(existingUser.otpExpires)) {
                return res.status(201).json({ message: "OTP sent to your email. Please verify.", email: existingUser.email });
            }
            existingUser.otp = otp;
            existingUser.otpExpires = otpExpires;
            existingUser.otpAttempts = 0;
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
            try {
                await User.deleteOne({ _id: user._id });
            } catch (cleanupError) {
                console.error('Failed to clean up unverified user after email failure:', cleanupError);
            }
        }
        console.error('Failed to send OTP email:', error);
        res.status(500).json({ message: 'Email could not be sent. Please check if the email is valid, or try again in a moment.' });
    }
};

// @desc    Resend OTP for an unverified account
// @route   POST /api/users/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    let user;
    try {
        user = await findByEmail(email);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }

    // Same reply whether or not there is a pending registration, so this endpoint
    // cannot be used to discover which emails are registered.
    const generic = { message: 'If a registration is waiting for this email, a new OTP has been sent.' };
    if (!user || user.isVerified || issuedRecently(user.otpExpires)) {
        if (!user) await dummyWrite();
        return res.json(generic);
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpAttempts = 0;

    try {
        await user.save();
    } catch (error) {
        console.error('Failed to save resent OTP:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
    // Answer immediately. Waiting for the mail server made real, pending accounts
    // respond measurably slower than unknown emails (a timing leak); a failed send
    // is logged and the user can simply press Resend again.
    sendOtpEmail(email, otp, 'verify').catch((e) => console.error('Failed to resend OTP email:', e));
    res.json(generic);
};

// @desc    Verify OTP
// @route   POST /api/users/verify
// @access  Public
const verifyEmail = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const otp = toStr(req.body.otp, 10);
    const invalid = { message: 'Invalid or Expired OTP' };

    try {
        const found = await findByEmail(email).select('_id');
        if (!found) return res.status(400).json(invalid);

        // Spend one guess ATOMICALLY before comparing. Reading the counter, comparing
        // and then saving it let parallel requests all read "0 attempts" and each
        // get a free guess; the conditional $inc makes the budget a hard limit.
        const user = await User.findOneAndUpdate(
            { _id: found._id, otp: { $exists: true, $ne: null }, otpExpires: { $gt: new Date() }, otpAttempts: { $lt: MAX_OTP_ATTEMPTS } },
            { $inc: { otpAttempts: 1 } },
            { new: true }
        );
        if (!user) return res.status(400).json(invalid); // no live code, expired, or guesses used up

        if (user.otp !== otp) {
            if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
                await User.updateOne({ _id: user._id }, { $unset: { otp: 1, otpExpires: 1 } }); // burn the code
            }
            return res.status(400).json(invalid);
        }

        // The password the person TYPES while verifying must match the one stored for this
        // registration. Otherwise an attacker could register a victim's email first with
        // the attacker's password, wait for the victim to sign up and verify, and then
        // log in as them. (Whoever really owns the email can always use "Forgot password":
        // that needs the emailed code too, replaces the password and verifies the account.)
        const typed = toStr(req.body.password, 200);
        if (!typed || !(await user.matchPassword(typed))) {
            return res.status(400).json({
                message: 'That password does not match the one this registration was started with. Use "Forgot password" to set a new one - it also verifies your email.',
            });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save();

        // Fire-and-forget: errors are handled inside sendWelcomeEmail
        sendWelcomeEmail(user.email, user.name);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            mobile: user.mobile,
            addresses: user.addresses,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Request a password reset OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    // Same answer whether or not the account exists, so this endpoint can't be
    // used to find out which emails are registered.
    const genericReply = { message: 'If an account exists for that email, a password reset code has been sent.' };

    try {
        const user = isEmail(email) ? await findByEmail(email) : null;
        if (!user) {
            await dummyWrite();
            return res.json(genericReply);
        }

        if (issuedRecently(user.resetOtpExpires)) {
            return res.json(genericReply);
        }
        user.resetOtp = generateOtp();
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.resetOtpAttempts = 0;
        await user.save();
        // not awaited: same response time for known and unknown emails
        sendOtpEmail(user.email, user.resetOtp, 'reset').catch((e) => console.error('Failed to send password reset email:', e));
        res.json(genericReply);
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        res.json(genericReply);
    }
};

// @desc    Reset password using the emailed OTP
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const otp = toStr(req.body.otp, 10);
    const password = toStr(req.body.password, 200);
    const invalid = { message: 'Invalid or expired code. Please request a new one.' };
    try {
        if (password.length < MIN_PASSWORD) {
            return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
        }

        const found = await findByEmail(email).select('_id');
        if (!found) return res.status(400).json(invalid);

        // Atomic guess budget (see verifyEmail)
        const user = await User.findOneAndUpdate(
            { _id: found._id, resetOtp: { $exists: true, $ne: null }, resetOtpExpires: { $gt: new Date() }, resetOtpAttempts: { $lt: MAX_OTP_ATTEMPTS } },
            { $inc: { resetOtpAttempts: 1 } },
            { new: true }
        );
        if (!user) return res.status(400).json(invalid);

        if (user.resetOtp !== otp) {
            if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
                await User.updateOne({ _id: user._id }, { $unset: { resetOtp: 1, resetOtpExpires: 1 } });
            }
            return res.status(400).json(invalid);
        }

        user.password = password; // re-hashed by the pre-save hook (also revokes older tokens)
        user.isVerified = true;   // entering the emailed code proves they own this address
        user.otp = undefined;
        user.otpExpires = undefined;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        user.resetOtpAttempts = 0;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            mobile: user.mobile,
            addresses: user.addresses,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                mobile: user.mobile,
                addresses: user.addresses,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const newEmail = req.body.email !== undefined ? normalizeEmail(req.body.email) : user.email;
            const newPassword = toStr(req.body.password, 200);
            const emailChanged = newEmail && newEmail !== normalizeEmail(user.email); // legacy accounts may be stored with capitals

            if (emailChanged) {
                // The new address was never verified (no code sent to it), which would let
                // anyone take over an email they don't own. Keep it fixed until there is a
                // proper "verify new email" step. (The profile form already shows it read-only.)
                return res.status(400).json({ message: 'Changing your email address is not supported yet. Please contact support.' });
            }
            if (newPassword && newPassword.length < MIN_PASSWORD) {
                return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
            }

            // Changing the email or password is account-takeover territory (e.g. a
            // stolen/shared logged-in session) - require the current password.
            if (emailChanged || newPassword) {
                const current = toStr(req.body.currentPassword, 200);
                if (!current || !(await user.matchPassword(current))) {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
            }

            user.name = toStr(req.body.name, 100) || user.name;
            if (emailChanged) user.email = newEmail;
            if (req.body.mobile !== undefined) {
                user.mobile = toStr(req.body.mobile, 20);
            }
            if (newPassword) {
                user.password = newPassword;
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                mobile: updatedUser.mobile,
                addresses: updatedUser.addresses,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        // Duplicate key error - most commonly hit when changing your email
        // to one that's already registered to another account
        if (error.code === 11000) {
            return res.status(400).json({ message: 'That email is already in use' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a saved address
// @route   POST /api/users/address
// @access  Private
const addUserAddress = async (req, res) => {
    try {
        const address = toStr(req.body.address, 300);
        const city = toStr(req.body.city, 100);
        const postalCode = toStr(req.body.postalCode, 12);
        const country = toStr(req.body.country, 60);

        if (!address || !city) {
            return res.status(400).json({ message: 'Address and city are required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.addresses.length >= 20) {
            return res.status(400).json({ message: 'You can save up to 20 addresses. Please delete one first.' });
        }
        user.addresses.push({ address, city, postalCode, country: country || 'India' });
        await user.save();
        res.status(201).json({ addresses: user.addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not save address' });
    }
};

// @desc    Delete a saved address
// @route   DELETE /api/users/address/:addressId
// @access  Private
const deleteUserAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== req.params.addressId
        );
        await user.save();
        res.json({ addresses: user.addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Could not delete address' });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -otp -otpExpires -resetOtp -resetOtpExpires');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
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
    addUserAddress,
    deleteUserAddress,
    getUsers,
    deleteUser
};