const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function sanitizeUser(user) {
  const object = user.toObject ? user.toObject() : { ...user };

  delete object.passwordHash;

  return object;
}

function buildAuthResponse(user) {
  return {
    token: signToken(user),
    user: sanitizeUser(user)
  };
}

module.exports = {
  buildAuthResponse,
  hashPassword,
  sanitizeUser,
  signToken,
  verifyPassword
};
