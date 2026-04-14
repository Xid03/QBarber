const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password/confirm', authController.confirmPasswordReset);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
