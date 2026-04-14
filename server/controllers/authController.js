const crypto = require('crypto');
const Shop = require('../models/Shop');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { buildAuthResponse, hashPassword, verifyPassword } = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role = 'customer',
    shop
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'name, email, and password are required.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with that email already exists.'
    });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: normalizedEmail,
    phone,
    passwordHash,
    role
  });

  let createdShop = null;

  if (role === 'owner' && shop?.name) {
    createdShop = await Shop.create({
      name: shop.name,
      ownerId: user._id,
      address: shop.address || '',
      phone: shop.phone || '',
      email: shop.email || normalizedEmail,
      operatingHours: {
        open: shop.open || '09:00',
        close: shop.close || '20:00'
      },
      branches: shop.branches || []
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      ...buildAuthResponse(user),
      shop: createdShop
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'email and password are required.'
    });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const ownedShop = user.role === 'owner'
    ? await Shop.findOne({ ownerId: user._id })
    : null;

  return res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      ...buildAuthResponse(user),
      shop: ownedShop
    }
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const ownedShop = req.user.role === 'owner'
    ? await Shop.findOne({ ownerId: req.user._id })
    : null;

  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
      shop: ownedShop
    }
  });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'email is required.'
    });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  const resetToken = crypto.randomBytes(24).toString('hex');

  return res.status(200).json({
    success: true,
    message: user
      ? 'Password reset request accepted. Use the mocked token in development.'
      : 'If an account exists, a password reset instruction will be sent.',
    data: process.env.NODE_ENV === 'development'
      ? {
          resetToken,
          email: email.trim().toLowerCase()
        }
      : null
  });
});

const confirmPasswordReset = asyncHandler(async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Password reset confirmation flow is scaffolded for a future email provider integration.',
    data: {
      received: req.body
    }
  });
});

module.exports = {
  confirmPasswordReset,
  getProfile,
  login,
  register,
  requestPasswordReset
};
