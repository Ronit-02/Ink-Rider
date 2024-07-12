const express = require('express');
const router = express.Router();
const {fetchUserWithPosts, fetchProfileWithPosts, searchUser, fetchUser, followUnfollowUser, fetchFollowedUserPosts} = require('../controllers/userController');
const validateToken = require('../middlewares/authMiddleware')

// specific routes
router.get('/', fetchUser);
router.get('/followed-posts', validateToken, fetchFollowedUserPosts);
router.get('/profile', validateToken, fetchProfileWithPosts);
router.get('/search', searchUser);

// dynamic routes
router.get('/:id', fetchUserWithPosts);

// put routes
router.put('/:id/follow', validateToken, followUnfollowUser);

module.exports = router;