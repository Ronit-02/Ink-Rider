const express = require('express');
const router = express.Router();
const {fetchUserWithPosts, fetchProfileWithPosts, searchUser, fetchUser, followUnfollowUser, fetchFollowedUserPosts, updateUser, fetchProfile, updatePassword} = require('../controllers/userController');
const validateToken = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multerMiddleware');

// specific routes
router.get('/', fetchUser);
router.get('/followed-posts', validateToken, fetchFollowedUserPosts);

router.get('/profile', validateToken, fetchProfile);
router.get('/profile-with-posts', validateToken, fetchProfileWithPosts);
router.get('/search', searchUser);

// dynamic routes
router.get('/:id', fetchUserWithPosts);

// put routes
router.put('/profile/edit', validateToken, upload.single('imageURL'), updateUser);
router.put('/profile/update-password', validateToken, updatePassword);
router.put('/:id/follow', validateToken, followUnfollowUser);

module.exports = router;