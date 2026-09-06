const mongoose = require('mongoose');
const Post = require('../schemas/post.schema');
const { hasCapability } = require('../services/entitlement.service');
const { getOrCreateSummary } = require('../services/summary.service');

const getPostSummary = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ message: 'Invalid post id' });
    if (!await hasCapability(req.auth.userId, 'article_summary')) return res.status(403).json({ code: 'ENTITLEMENT_REQUIRED', message: 'Article summaries require an active membership' });
    const post = await Post.findById(req.params.postId).select('body publicAt publicationStatus author');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.publicationStatus === 'unpublished' && post.author.toString() !== req.auth.userId) return res.status(404).json({ message: 'Post not found' });
    if (post.publicAt && post.publicAt > new Date() && !await hasCapability(req.auth.userId, 'early_access')) return res.status(404).json({ message: 'Post not found' });
    const summary = await getOrCreateSummary(post);
    return res.status(200).json({ data: { points: summary.points, provider: summary.provider, disclosure: summary.disclosure, generatedAt: summary.generatedAt } });
  } catch (error) {
    console.error(`[${req.requestId}] Summary generation failed`);
    return res.status(500).json({ message: 'Unable to generate article overview' });
  }
};

module.exports = { getPostSummary };
