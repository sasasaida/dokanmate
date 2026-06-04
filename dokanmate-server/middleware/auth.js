// middleware/auth.js
// Protects sync routes — verifies JWT on every request.
// Attaches shop identity to req.shop for use in controllers.

const { verifyToken } = require('../services/tokenService');

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code:  'NO_TOKEN',
      });
    }

    const token   = header.split(' ')[1];
    const decoded = verifyToken(token);

    // Make shopId available to all downstream controllers
    req.shop = {
      shopId: decoded.shopId,
      phone:  decoded.phone,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please login again.',
        code:  'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code:  'INVALID_TOKEN',
    });
  }
};