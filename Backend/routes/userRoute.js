const express = require('express');
const router = express.Router();
const {fetchUserWithPosts, fetchProfileWithPosts, searchUser} = require('../controllers/userController');
const validateToken = require('../middlewares/authMiddleware')

// specific routes
router.get('/profile', validateToken, fetchProfileWithPosts);
router.get('/search', searchUser);

// dynamic routes
router.get('/:id', fetchUserWithPosts);

module.exports = router;