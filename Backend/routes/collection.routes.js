const express        = require('express');
const router         = express.Router();
const validateToken  = require('../middlewares/auth.middleware');
const { getCollections, getCollectionById, createCollection, updateCollection, deleteCollection, toggleSave } = require('../controllers/collection.controller');

/* Public */
router.get('/',    getCollections);
router.get('/:id', getCollectionById);

/* Auth required */
router.post('/',           validateToken, createCollection);
router.put('/:id',         validateToken, updateCollection);
router.delete('/:id',      validateToken, deleteCollection);
router.post('/:id/save',   validateToken, toggleSave);

module.exports = router;