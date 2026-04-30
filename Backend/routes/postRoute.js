const express = require('express');
const router = express.Router();
const validateToken = require('../middlewares/authMiddleware');
const { createPost, getAllPosts, searchPost, searchCategory } = require('../controllers/postController');
const { upload } = require('../middlewares/multerMiddleware');

// Posts
router.get('/', getAllPosts);
router.get('/search', searchPost);
router.get('/search-cat', searchCategory);
router.post('/', validateToken, upload.single('imageURL'), createPost);

module.exports = router;