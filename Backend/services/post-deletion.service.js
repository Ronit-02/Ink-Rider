const Post = require('../schemas/post.schema');
const Comment = require('../schemas/comment.schema');
const CommentLike = require('../schemas/comment-like.schema');
const Save = require('../schemas/save.schema');
const Like = require('../schemas/like.schema');
const Report = require('../schemas/report.schema');
const { withTransaction, withOptionalSession } = require('../utils/transaction');

const deleteOwnedPost = ({ postId, userId }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  const post = await withOptionalSession(Post.findOne({ _id: postId, author: userId }).select('_id'), session);
  if (!post) return false;

  // Keep the owned post until cleanup succeeds, so standalone failures can be retried.
  // Retain immutable revisions and completed moderation history.
  await Report.deleteMany({ subjectType: 'post', subjectId: postId, status: 'pending' }, options);
  // Bound memory and $in payloads even for posts with large discussions.
  while (true) {
    const comments = await withOptionalSession(Comment.find({ postId }).select('_id').limit(500).lean(), session);
    if (!comments.length) break;
    const commentIds = comments.map(comment => comment._id);
    await Report.deleteMany({ subjectType: 'comment', subjectId: { $in: commentIds }, status: 'pending' }, options);
    await CommentLike.deleteMany({ commentId: { $in: commentIds } }, options);
    await Comment.deleteMany({ postId, _id: { $in: commentIds } }, options);
  }
  await Like.deleteMany({ postId }, options);
  await Save.deleteMany({ postId }, options);
  await Post.deleteOne({ _id: postId, author: userId }, options);
  return true;
});

module.exports = { deleteOwnedPost };
