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
    // If the password field wasn't touched on this save (e.g. saving after
    // OTP verification, adding an address, or any other unrelated update),
    // skip hashing entirely and move on - critically, this must RETURN so
    // the code below never runs, otherwise the already-hashed password gets
    // hashed again on every single save, permanently corrupting it and
    // locking the user out (bcrypt.compare against the double-hash will
    // never match their real password again).
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Must explicitly call next() here too - Mongoose treats a pre-save
    // hook that declares a `next` parameter as callback-style and waits
    // for it to be invoked; without this the save() call would hang
    // indefinitely whenever the password actually is being set (i.e.
    // registration and password reset).
    next();
});

module.exports = mongoose.model('User', userSchema);