const express       = require('express');
const router        = express.Router();
const validateToken = require('../middlewares/auth.middleware');
const { fetchUser, updateProfile, toggleFollow, toggleBookmark, getBookmarks, getAnalytics, toggleLike, addComment } = require('../controllers/user.controller');

/* Public */
router.get('/', fetchUser);

/* Auth required */
router.put('/profile',                validateToken, updateProfile);
router.post('/follow/:id',            validateToken, toggleFollow);
router.post('/bookmark/:postId',      validateToken, toggleBookmark);
router.get('/bookmarks',              validateToken, getBookmarks);
router.get('/analytics',              validateToken, getAnalytics);
router.post('/like/:postId',          validateToken, toggleLike);
router.post('/comment/:postId',       validateToken, addComment);

module.exports = router;