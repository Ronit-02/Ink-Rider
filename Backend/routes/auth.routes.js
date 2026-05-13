const express = require('express');
const router = express.Router();
const { login, signup, verifyEmail, resendOtp, refreshToken } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/refresh-token', refreshToken);

module.exports = router;