const express = require('express');
const router = express.Router();
const { login, signup, verifyEmail, logout, logoutAll, resendOtp, refreshToken, googleLogin } = require('../controllers/auth.controller');
const { createRateLimiter } = require('../middlewares/rate-limit.middleware');

const credentialLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, keyPrefix: 'auth-credential' });
const refreshLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 180, keyPrefix: 'auth-refresh' });

router.post('/login', credentialLimiter, login);
router.post('/google', credentialLimiter, googleLogin);
router.post('/signup', credentialLimiter, signup);
router.post('/verify-email', credentialLimiter, verifyEmail);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.post('/resend-otp', credentialLimiter, resendOtp);
router.post('/refresh-token', refreshLimiter, refreshToken);

module.exports = router;
