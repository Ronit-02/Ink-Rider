const Comment = require('../schemas/comment.schema');
const Like = require('../schemas/like.schema');
const CommentLike = require('../schemas/comment-like.schema');
const Post = require('../schemas/post.schema');
const { withTransaction, withOptionalSession } = require('../utils/transaction');

const setLike = ({ postId, userId, liked }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  if (liked) {
    const result = await Like.updateOne({ userId, postId }, { $setOnInsert: { userId, postId } }, { upsert: true, ...options });
    if (result.upsertedCount === 1) await Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } }, options);
  } else {
    const result = await Like.deleteOne({ userId, postId }, options);
    if (result.deletedCount === 1) await Post.updateOne({ _id: postId, likesCount: { $gt: 0 } }, { $inc: { likesCount: -1 } }, options);
  }
  const post = await withOptionalSession(Post.findById(postId).select('likesCount'), session);
  return { isLiked: liked, likesCount: post?.likesCount || 0 };
});

const addComment = ({ postId, userId, content, parentCommentId = null }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  const [comment] = await Comment.create([{ postId, userId, content, parentCommentId }], options);
  await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } }, options);
  const populated = await withOptionalSession(
    Comment.findById(comment._id).populate({ path: 'userId', select: 'picture username bio' }),
    session,
  );
  return {
    id: populated._id,
    content: populated.content,
    createdAt: populated.createdAt,
    parentCommentId: populated.parentCommentId,
    canEdit: true,
    canDelete: true,
    isLiked: false,
    likesCount: 0,
    repliesCount: 0,
    author: { id: populated.userId._id, name: populated.userId.username, avatar: populated.userId.picture, bio: populated.userId.bio },
  };
});

const presentComments = async (comments, userId) => {
  const ids = comments.map(comment => comment._id);
  const [likes, replies, viewerLikes] = ids.length ? await Promise.all([
    CommentLike.aggregate([
      { $match: { commentId: { $in: ids } } },
      { $group: { _id: '$commentId', count: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $match: { parentCommentId: { $in: ids } } },
      { $group: { _id: '$parentCommentId', count: { $sum: 1 } } },
    ]),
    userId ? CommentLike.find({ commentId: { $in: ids }, userId }).select('commentId').lean() : [],
  ]) : [[], [], []];
  const likeCounts = new Map(likes.map(row => [String(row._id), row.count]));
  const replyCounts = new Map(replies.map(row => [String(row._id), row.count]));
  const likedIds = new Set(viewerLikes.map(row => String(row.commentId)));
  return comments.map(comment => ({
    id: comment._id,
    content: comment.deletedAt ? '' : comment.content,
    isDeleted: Boolean(comment.deletedAt),
    createdAt: comment.createdAt,
    parentCommentId: comment.parentCommentId,
    canEdit: Boolean(!comment.deletedAt && userId && String(comment.userId?._id) === String(userId)),
    canDelete: Boolean(!comment.deletedAt && userId && String(comment.userId?._id) === String(userId)),
    likesCount: comment.deletedAt ? 0 : likeCounts.get(String(comment._id)) || 0,
    isLiked: !comment.deletedAt && likedIds.has(String(comment._id)),
    repliesCount: replyCounts.get(String(comment._id)) || 0,
    author: !comment.deletedAt && comment.userId ? {
      id: comment.userId._id, name: comment.userId.username,
      avatar: comment.userId.picture, bio: comment.userId.bio,
    } : null,
  }));
};

const setCommentLike = async ({ commentId, userId, liked }) => {
  if (liked) {
    try {
      await CommentLike.updateOne({ commentId, userId }, { $setOnInsert: { commentId, userId } }, { upsert: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  } else {
    await CommentLike.deleteOne({ commentId, userId });
  }
  return { id: commentId, isLiked: liked, likesCount: await CommentLike.countDocuments({ commentId }) };
};

module.exports = { setLike, addComment, presentComments, setCommentLike };
