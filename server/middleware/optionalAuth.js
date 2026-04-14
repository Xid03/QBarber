const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7).trim();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');

    if (user) {
      req.user = user;
      req.auth = payload;
    }
  } catch (error) {
    // Invalid optional tokens are ignored so anonymous joins still work.
  }

  return next();
}

module.exports = optionalAuth;
