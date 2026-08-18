const mongoose = require('mongoose');
const Comment = require('../schemas/comment.schema');
const Like = require('../schemas/like.schema');
const Post = require('../schemas/post.schema');
const Save = require('../schemas/save.schema');
const Report = require('../schemas/report.schema');
const { reportReasons } = Report;
const { getPostAccessContext, canAccessPost } = require('../services/post-access.service');
const { setLike, addComment: createCommentWorkflow } = require('../services/engagement.service');

const isValidId = id => mongoose.isValidObjectId(id);

const requirePost = async (postId, actorId, select = '_id author publicationStatus publicAt') => {
  if (!isValidId(postId)) return { error: 'INVALID_ID' };
  const requiredFields = 'author publicationStatus publicAt';
  const post = await Post.findById(postId).select(`${select} ${requiredFields}`);
  if (!post) return { error: 'NOT_FOUND' };
  const context = await getPostAccessContext(actorId);
  return canAccessPost(post, context) ? { post } : { error: 'NOT_FOUND' };
};

const sendPostLookupError = (res, error) => {
  if (error === 'INVALID_ID') {
    return res.status(400).json({ message: 'Invalid post id' });
  }
  return res.status(404).json({ message: 'Post not found' });
};

const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const lookup = await requirePost(postId, req.auth.userId);
    if (lookup.error) return sendPostLookupError(res, lookup.error);

    await Save.updateOne(
      { userId: req.auth.userId, postId },
      { $setOnInsert: { userId: req.auth.userId, postId } },
      { upsert: true }
    );

    return res.status(200).json({ isBookmarked: true });
  } catch (error) {
    console.error(`[${req.requestId}] Save post failed`);
    return res.status(500).json({ message: 'Unable to save post' });
  }
};

const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const lookup = await requirePost(postId, req.auth.userId);
    if (lookup.error) return sendPostLookupError(res, lookup.error);

    await Save.deleteOne({ userId: req.auth.userId, postId });
    return res.status(200).json({ isBookmarked: false });
  } catch (error) {
    console.error(`[${req.requestId}] Unsave post failed`);
    return res.status(500).json({ message: 'Unable to remove saved post' });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const lookup = await requirePost(postId, req.auth.userId, '_id likesCount');
    if (lookup.error) return sendPostLookupError(res, lookup.error);

    return res.status(200).json(await setLike({ postId, userId: req.auth.userId, liked: true }));
  } catch (error) {
    console.error(`[${req.requestId}] Like post failed`);
    return res.status(500).json({ message: 'Unable to appreciate post' });
  }
};

const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const lookup = await requirePost(postId, req.auth.userId, '_id likesCount');
    if (lookup.error) return sendPostLookupError(res, lookup.error);

    return res.status(200).json(await setLike({ postId, userId: req.auth.userId, liked: false }));
  } catch (error) {
    console.error(`[${req.requestId}] Unlike post failed`);
    return res.status(500).json({ message: 'Unable to remove appreciation' });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const lookup = await requirePost(postId, req.auth?.userId);
    if (lookup.error) return sendPostLookupError(res, lookup.error);

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;
    const filter = { postId, parentCommentId: null };

    if (req.query.cursor) {
      if (!isValidId(req.query.cursor)) {
        return res.status(400).json({ message: 'Invalid comment cursor' });
      }
      filter._id = { $lt: req.query.cursor };
    }

    const comments = await Comment.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate({ path: 'userId', select: 'picture username bio' });

    const hasMore = comments.length > limit;
    const page = hasMore ? comments.slice(0, limit) : comments;
    const data = page.map(comment => ({
      id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.userId ? {
        id: comment.userId._id,
        name: comment.userId.username,
        avatar: comment.userId.picture,
        bio: comment.userId.bio,
      } : null,
    }));

    return res.status(200).json({
      data,
      meta: {
        nextCursor: hasMore ? page[page.length - 1]._id : null,
      },
    });
  } catch (error) {
    console.error(`[${req.requestId}] Comment listing failed`);
    return res.status(500).json({ message: 'Unable to load comments' });
  }
};

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const content = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!content) return res.status(400).json({ message: 'Comment text is required' });
    if (content.length > 1000) return res.status(400).json({ message: 'Comment is too long' });

    const lookup = await requirePost(postId, req.auth.userId);
    if (lookup.error) return sendPostLookupError(res, lookup.error);

    return res.status(201).json({ data: await createCommentWorkflow({ postId, userId: req.auth.userId, content }) });
  } catch (error) {
    console.error(`[${req.requestId}] Comment creation failed`);
    return res.status(500).json({ message: 'Unable to add comment' });
  }
};

const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const reason = String(req.body.reason || '').trim().toLowerCase();
    const details = typeof req.body.details === 'string' ? req.body.details.trim() : '';

    if (!reportReasons.includes(reason)) {
      return res.status(400).json({ message: 'Select a valid report reason' });
    }
    if (details.length > 1000) {
      return res.status(400).json({ message: 'Report details are too long' });
    }

    const lookup = await requirePost(postId, req.auth.userId);
    if (lookup.error) return sendPostLookupError(res, lookup.error);

    const result = await Report.updateOne(
      {
        reporterId: req.auth.userId,
        subjectType: 'post',
        subjectId: postId,
      },
      {
        $setOnInsert: {
          reporterId: req.auth.userId,
          subjectType: 'post',
          subjectId: postId,
          reason,
          details,
          status: 'pending',
        },
      },
      { upsert: true }
    );

    return res.status(result.upsertedCount === 1 ? 201 : 200).json({
      reported: true,
      alreadyReported: result.upsertedCount !== 1,
    });
  } catch (error) {
    console.error(`[${req.requestId}] Post report failed`);
    return res.status(500).json({ message: 'Unable to submit report' });
  }
};

module.exports = {
  savePost,
  unsavePost,
  likePost,
  unlikePost,
  getComments,
  createComment,
  reportPost,
};
