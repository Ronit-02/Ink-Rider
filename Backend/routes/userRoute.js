const express = require('express');
const router = express.Router();
const {fetchProfile, fetchProfileWithPosts} = require('../controllers/userController');
const validateToken = require('../middlewares/authMiddleware')

router.get('/profile', validateToken, fetchProfile);
router.get('/posts', validateToken, fetchProfileWithPosts);

module.exports = router;