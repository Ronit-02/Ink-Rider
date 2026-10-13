const mongoose = require('mongoose');
const ReadingState = require('../schemas/reading-state.schema');
const Post = require('../schemas/post.schema');
const { getPostAccessContext, accessiblePostClause } = require('../services/post-access.service');

const updateReadingState = async (req, res) => {
  const postId = String(req.params.postId || '');
  const progress = Number(req.body?.progress);
  const completed = req.body?.completed === true;
  if (!mongoose.isValidObjectId(postId) || !Number.isFinite(progress) || progress < 0 || progress > 100) {
    return res.status(400).json({ message: 'A valid post and progress value are required' });
  }

  try {
    const context = await getPostAccessContext(req.auth.userId);
    const post = await Post.findOne({ _id: postId, ...accessiblePostClause(context) }).select('_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const state = await ReadingState.findOneAndUpdate(
      { userId: req.auth.userId, postId },
      {
        $max: { progress: completed ? 100 : progress },
        $set: { lastReadAt: new Date(), ...(completed ? { completed: true } : {}) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    ).select('progress completed lastReadAt');
    return res.status(200).json({ data: state });
  } catch (error) {
    console.error(`[${req.requestId}] Reading state update failed`);
    return res.status(500).json({ message: 'Unable to save reading progress' });
  }
};

module.exports = { updateReadingState };
