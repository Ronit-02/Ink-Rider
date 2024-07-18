const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoute');
const userRoutes = require('./userRoute');
const postRoutes = require('./postRoute');
const paymentRoutes = require('./paymentRoute');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/post', postRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;