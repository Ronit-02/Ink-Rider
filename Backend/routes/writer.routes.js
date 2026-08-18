const express = require('express');
const { validateToken, optionalAuth } = require('../middlewares/auth.middleware');
const {
  getWriterByHandle,
  followWriter,
  unfollowWriter,
} = require('../controllers/writer.controller');

const router = express.Router();

router.put('/:writerId/follow', validateToken, followWriter);
router.delete('/:writerId/follow', validateToken, unfollowWriter);
router.get('/:handle', optionalAuth, getWriterByHandle);

module.exports = router;
