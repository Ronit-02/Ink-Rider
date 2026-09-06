const express = require('express');
const { validateToken } = require('../middlewares/auth.middleware');
const { listDrafts, getDraft, createDraft, updateDraft, deleteDraft } = require('../controllers/draft.controller');

const router = express.Router();
router.use(validateToken);
router.get('/', listDrafts);
router.post('/', createDraft);
router.get('/:draftId', getDraft);
router.put('/:draftId', updateDraft);
router.delete('/:draftId', deleteDraft);

module.exports = router;
