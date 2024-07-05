const express = require('express');
const router = express.Router();

const { createPost, getAllPosts, getPost, deletePost, updatePost } = require('../controllers/postController');
const validateToken = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multerMiddleware');

router.post('/', validateToken, upload.single('imageURL') ,createPost);
router.get('/', getAllPosts);
router.get('/:id', getPost);
router.put('/:id', validateToken, updatePost);
router.delete('/:id', validateToken, deletePost);

module.exports = router;