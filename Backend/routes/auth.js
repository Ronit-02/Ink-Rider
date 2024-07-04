const express = require('express');
const passport = require('passport');
const {login, signup, verifyEmail, googleAuth, googleAuthCallback, forgotPassowrd, resetPassword} = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);
router.get('/google', googleAuth);
router.get('/google/callback',
    passport.authenticate('google', {failureRedirect: `${process.env.FRONTEND_URL}/login`}),  
    googleAuthCallback,
);
router.post('/forgot-password', forgotPassowrd);
router.post('/reset-password', resetPassword);

module.exports = router;