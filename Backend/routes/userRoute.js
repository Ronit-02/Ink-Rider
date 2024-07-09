const express = require('express');
const router = express.Router();
const {fetchUserWithPosts, fetchProfileWithPosts} = require('../controllers/userController');
const validateToken = require('../middlewares/authMiddleware')

// specific routes
router.get('/profile', validateToken, fetchProfileWithPosts);

// dynamic routes
router.get('/:id', fetchUserWithPosts);

module.exports = router;