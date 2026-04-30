const express = require('express')
const router = express.Router();
const { fetchUser } = require('../controllers/userController')

// specific routes
router.get('/', fetchUser);

module.exports = router;