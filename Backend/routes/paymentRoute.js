const express = require('express');
const { getPaymentOrder, verifyPayment } = require('../controllers/paymentControllers');
const validateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/order', validateToken, getPaymentOrder);
router.post('/verify', validateToken, verifyPayment);

module.exports = router;