const express = require('express');
const router = express.Router();
const { login, signup, verifyEmail } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);

module.exports = router;