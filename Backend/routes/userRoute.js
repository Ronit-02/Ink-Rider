const express = require('express');
const router = express.Router();
const {fetchUserWithPosts, fetchProfileWithPosts, searchUser, fetchUser} = require('../controllers/userController');
const validateToken = require('../middlewares/authMiddleware')

// specific routes
router.get('/no-posts', fetchUser);
router.get('/profile', validateToken, fetchProfileWithPosts);
router.get('/search', searchUser);

// dynamic routes
router.get('/:id', fetchUserWithPosts);

module.exports = router;