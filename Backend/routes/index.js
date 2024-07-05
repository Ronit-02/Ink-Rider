const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./user');
const postRoutes = require('./post');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/post', postRoutes);

module.exports = router;