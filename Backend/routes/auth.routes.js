const express = require('express');
const router = express.Router();
const { login, signup, verifyEmail, logout, logoutAll, resendOtp, refreshToken, googleLogin } = require('../controllers/auth.controller');
const { createRateLimiter } = require('../middlewares/rate-limit.middleware');

const credentialLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, keyPrefix: 'auth-credential' });
const accountCredentialLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyPrefix: 'auth-account',
    keyResolver: req => String(req.body?.email || '').trim().toLowerCase().slice(0, 254),
});
const refreshLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 180, keyPrefix: 'auth-refresh' });
const requireTrustedOrigin = (req, res, next) => {
    const origin = req.get('Origin');
    if (origin !== require('../config/config').FRONTEND_URL) {
        return res.status(403).json({ success: false, message: 'Request not allowed' });
    }
    return next();
};

router.post('/login', credentialLimiter, accountCredentialLimiter, login);
router.post('/google', credentialLimiter, googleLogin);
router.post('/signup', credentialLimiter, accountCredentialLimiter, signup);
router.post('/verify-email', credentialLimiter, accountCredentialLimiter, verifyEmail);
router.post('/logout', requireTrustedOrigin, logout);
router.post('/logout-all', requireTrustedOrigin, logoutAll);
router.post('/resend-otp', credentialLimiter, accountCredentialLimiter, resendOtp);
router.post('/refresh-token', requireTrustedOrigin, refreshLimiter, refreshToken);

module.exports = router;
