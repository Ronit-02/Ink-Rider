const express       = require('express');
const router        = express.Router();
const { validateToken } = require('../middlewares/auth.middleware');
const { getMe, getMyPosts, fetchUser, updateProfile, getBookmarks, getAnalytics } = require('../controllers/user.controller');

/* Public */
router.get('/', fetchUser);

/* Auth required */
router.put('/profile',                validateToken, updateProfile);
router.get('/me',                     validateToken, getMe);
router.get('/me/posts',               validateToken, getMyPosts);
router.get('/bookmarks',              validateToken, getBookmarks);
router.get('/analytics',              validateToken, getAnalytics);

module.exports = router;
