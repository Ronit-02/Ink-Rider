const express = require('express');
const router = express.Router();

const { createPost, getAllPosts, getPost, deletePost, updatePost, addComment, deleteComment } = require('../controllers/postController');
const validateToken = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multerMiddleware');

// Posts
router.post('/', validateToken, upload.single('imageURL') ,createPost);
router.get('/', getAllPosts);
router.get('/:id', getPost);
router.put('/:id', validateToken, upload.single('imageURL'), updatePost);
router.delete('/:id', validateToken, deletePost);

// Comments
router.post('/:id/comment', validateToken, addComment)
router.delete('/:id/delete-comment', validateToken, deleteComment);

module.exports = router;