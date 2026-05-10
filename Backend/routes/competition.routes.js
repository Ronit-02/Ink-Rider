const express       = require('express');
const router        = express.Router();
const validateToken = require('../middlewares/auth.middleware');
const { getCompetitions, getCompetitionById, enterCompetition, likeEntry } = require('../controllers/competition.controller');

/* Public */
router.get('/',    getCompetitions);
router.get('/:id', getCompetitionById);

/* Auth required */
router.post('/:id/enter',                    validateToken, enterCompetition);
router.post('/:id/entries/:entryId/like',    validateToken, likeEntry);

module.exports = router;