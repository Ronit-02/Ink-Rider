const express       = require('express');
const router        = express.Router();
const validateToken = require('../middlewares/auth.middleware');
const { getQuestions, createQuestion, upvoteQuestion, postAnswer } = require('../controllers/question.controller');

/* Public */
router.get('/', getQuestions);

/* Auth required */
router.post('/',                validateToken, createQuestion);
router.post('/:id/upvote',      validateToken, upvoteQuestion);
router.post('/:id/answer',      validateToken, postAnswer);

module.exports = router;