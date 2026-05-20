const express = require('express');
const router = express.Router();
const { validateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { toggleFollow, toggleBookmark, toggleLike, addComment } = require('../controllers/user.controller');
const { createPost, getAllPosts, getPost, searchPost, searchCategory } = require('../controllers/post.controller');
const { upload } = require('../middlewares/multer.middleware');

// Posts
router.get('/search', searchPost);
router.get('/search-cat', searchCategory);

router.post('/follow/:id',            validateToken, toggleFollow);
router.post('/bookmark/:postId',      validateToken, toggleBookmark);
router.post('/like/:postId',          validateToken, toggleLike);
router.post('/comment/:postId',       validateToken, addComment);

router.get('/', getAllPosts);

router.post('/', validateToken, upload.single('coverURL'), createPost);
router.get('/:id', optionalAuth, getPost);

module.exports = router;