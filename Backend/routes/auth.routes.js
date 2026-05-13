const express = require('express');
const router = express.Router();
const { login, signup, verifyEmail, logout, logoutAll, resendOtp, refreshToken } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.post('/resend-otp', resendOtp);
router.post('/refresh-token', refreshToken);

module.exports = router;