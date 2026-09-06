const express = require('express');
const { validateToken, requireRoles } = require('../middlewares/auth.middleware');
const moderation = require('../controllers/moderation.controller');

const router = express.Router();
router.use(validateToken, requireRoles('moderator', 'admin'));
router.get('/reports', moderation.listReports);
router.post('/reports/:reportId/reviews', moderation.recordReview);
router.get('/competition-fraud', moderation.listCompetitionFraudSignals);
router.post('/competition-fraud/reviews', moderation.reviewCompetitionFraudSignal);

module.exports = router;
