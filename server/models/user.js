const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false }, // Critical for Admin Panel
    mobile: { type: String, default: '' },
    addresses: [
      {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String },
        country: { type: String, default: 'India' },
      }
    ],

    // === ADDED FIELDS FOR OTP VERIFICATION ===
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },

    // === ADDED FIELDS FOR PASSWORD RESET ===
    resetOtp: { type: String },
    resetOtpExpires: { type: Date }
}, { timestamps: true });

// Method to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    // Without this return, execution fell through to the hashing lines
    // below EVERY time a document was saved - even when password wasn't
    // touched. That re-hashed the already-hashed value on top of itself,
    // permanently corrupting it, since bcrypt.compare() at login would then
    // compare the real password against a hash-of-a-hash and always fail.
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);