const jwt = require('jsonwebtoken');
const dbFallback = require('../utils/dbFallback');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_erp_key_2026';

// ======================
// PROTECT MIDDLEWARE
// ======================
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    // ❌ Invalid token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user
    const user = dbFallback.findById('users', decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // ✅ Attach user to request (no password exposed)
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId || null,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// ======================
// AUTHORIZE MIDDLEWARE
// ======================
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not allowed to perform this action`,
    });
  }
  next();
};

module.exports = { protect, authorize };
