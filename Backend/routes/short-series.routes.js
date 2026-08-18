const express = require('express');
const { optionalAuth, validateToken } = require('../middlewares/auth.middleware');
const { listSeries, getSeries, getEligibleShorts, createSeries, updateSeries } = require('../controllers/short-series.controller');

const router = express.Router();
router.get('/', optionalAuth, listSeries);
router.get('/eligible-shorts', validateToken, getEligibleShorts);
router.get('/:id', optionalAuth, getSeries);
router.post('/', validateToken, createSeries);
router.put('/:id', validateToken, updateSeries);

module.exports = router;
