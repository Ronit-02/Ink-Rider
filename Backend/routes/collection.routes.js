const express        = require('express');
const router         = express.Router();
const { validateToken, optionalAuth }  = require('../middlewares/auth.middleware');
const { getCollections, getCollectionById, getOwnCollectionPosts, createCollection, updateCollection, deleteCollection, saveCollection, unsaveCollection, followCollection, unfollowCollection } = require('../controllers/collection.controller');

/* Public */
router.get('/',    optionalAuth, getCollections);
router.get('/eligible-posts', validateToken, getOwnCollectionPosts);
router.get('/:id', optionalAuth, getCollectionById);

/* Auth required */
router.post('/',           validateToken, createCollection);
router.put('/:id',         validateToken, updateCollection);
router.delete('/:id',      validateToken, deleteCollection);
router.put('/:id/save',    validateToken, saveCollection);
router.delete('/:id/save', validateToken, unsaveCollection);
router.put('/:id/follow',    validateToken, followCollection);
router.delete('/:id/follow', validateToken, unfollowCollection);

module.exports = router;
