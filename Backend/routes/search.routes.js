const express = require('express');
const { optionalAuth } = require('../middlewares/auth.middleware');
const { search } = require('../controllers/search.controller');

const router = express.Router();
router.get('/', optionalAuth, search);

module.exports = router;
