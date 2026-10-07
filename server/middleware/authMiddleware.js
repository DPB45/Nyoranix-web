const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Only the token/user lookup is inside the try. Previously next() ran
    // inside it too, so an unrelated error thrown by a downstream handler was
    // mis-reported to the client as "token failed".
    let user;
    try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
    } catch (error) {
        const expired = error && error.name === 'TokenExpiredError';
        return res.status(401).json({
            message: expired ? 'Not authorized, session expired' : 'Not authorized, token failed',
        });
    }

    // Valid token, but the account no longer exists (deleted by an admin)
    if (!user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };