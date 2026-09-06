const Comment = require('../schemas/comment.schema');
const Like = require('../schemas/like.schema');
const Post = require('../schemas/post.schema');
const { withTransaction } = require('../utils/transaction');

const setLike = ({ postId, userId, liked }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  if (liked) {
    const result = await Like.updateOne({ userId, postId }, { $setOnInsert: { userId, postId } }, { upsert: true, ...options });
    if (result.upsertedCount === 1) await Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } }, options);
  } else {
    const result = await Like.deleteOne({ userId, postId }, options);
    if (result.deletedCount === 1) await Post.updateOne({ _id: postId, likesCount: { $gt: 0 } }, { $inc: { likesCount: -1 } }, options);
  }
  const post = await Post.findById(postId).select('likesCount').session(session);
  return { isLiked: liked, likesCount: post?.likesCount || 0 };
});

const addComment = ({ postId, userId, content }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  const [comment] = await Comment.create([{ postId, userId, content }], options);
  await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } }, options);
  const populated = await Comment.findById(comment._id).populate({ path: 'userId', select: 'picture username bio' }).session(session);
  return {
    id: populated._id,
    content: populated.content,
    createdAt: populated.createdAt,
    author: { id: populated.userId._id, name: populated.userId.username, avatar: populated.userId.picture, bio: populated.userId.bio },
  };
});

module.exports = { setLike, addComment };
