const express = require('express');
const router = express.Router();
const {fetchProfile} = require('../controllers/userController');
const validateToken = require('../middlewares/authMiddleware')

router.get('/profile', validateToken, fetchProfile);

module.exports = router;