const express = require('express');
const router = express.Router();
const validateToken = require('../middlewares/auth.middleware');
const { createPost, getAllPosts, getPost, searchPost, searchCategory } = require('../controllers/post.controller');
const { upload } = require('../middlewares/multer.middleware');

// Posts
router.post('/', validateToken, upload.single('coverURL'), createPost);
router.get('/:id', getPost);

router.get('/', getAllPosts);

router.get('/search', searchPost);
router.get('/search-cat', searchCategory);

module.exports = router;