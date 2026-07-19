const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Wrapper for async middleware to handle errors properly in Express 4
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  try {
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
      }

      // Verify token
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET environment variable is not set' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      return next();
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
});

// Admin middleware - check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Generic RBAC middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: `Access denied: Requires role ${roles.join(' or ')}` });
    }
  };
};

module.exports = { protect, admin, restrictTo };
