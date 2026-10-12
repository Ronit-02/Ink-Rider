const mongoose = require('mongoose');
const { deleteOwnedPost } = require('../services/post-deletion.service');

const deletePost = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ message: 'Invalid post id' });
  try {
    const deleted = await deleteOwnedPost({ postId: req.params.postId, userId: req.auth.userId });
    if (!deleted) return res.status(404).json({ message: 'Post not found' });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Unable to delete post. Please try again.' });
  }
};

module.exports = { deletePost };
