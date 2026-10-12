const mongoose = require('mongoose');
const { appendCollectionPost } = require('../services/collection-items.service');

const addCollectionPost = async (req, res) => {
  const { collectionId, postId } = req.params;
  if (!mongoose.isValidObjectId(collectionId) || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: 'Invalid collection or post id' });
  }
  try {
    const result = await appendCollectionPost({ collectionId, postId, actorId: req.auth.userId });
    return res.status(result.status).json(result.data ? { data: result.data } : { message: result.message });
  } catch {
    return res.status(500).json({ message: 'Unable to add story to collection' });
  }
};

module.exports = { addCollectionPost };
