const express = require('express');
const router = express.Router();

const { createPost, getAllPosts, getPost, deletePost, updatePost, addComment, deleteComment, searchPost, searchCategory, likeUnlikePost, saveUnsavePost } = require('../controllers/postController');
const validateToken = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multerMiddleware');

// Posts
router.get('/', getAllPosts);
router.get('/search', searchPost);
router.get('/search-cat', searchCategory);
router.get('/:id', getPost);
router.post('/', validateToken, upload.single('imageURL'), createPost);
router.put('/:id', validateToken, upload.single('imageURL'), updatePost);
router.delete('/:id', validateToken, deletePost);

// Actions
router.put('/:id/like', validateToken, likeUnlikePost);
router.put('/:id/save', validateToken, saveUnsavePost);

// Comments
router.post('/:id/comment', validateToken, addComment)
router.delete('/:id/delete-comment', validateToken, deleteComment);

module.exports = router;