const mongoose = require('mongoose');
const { connectToMongoDB } = require('../utils/mongoConnect');
const Comment = require('../schemas/comment.schema');
const Like = require('../schemas/like.schema');
const Post = require('../schemas/post.schema');

const toCountMap = rows => new Map(
  rows.map(row => [row._id.toString(), row.count])
);

const run = async () => {
  await connectToMongoDB();

  const [likeRows, commentRows, posts] = await Promise.all([
    Like.aggregate([
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]),
    Post.find().select('_id').lean(),
  ]);

  const likesByPost = toCountMap(likeRows);
  const commentsByPost = toCountMap(commentRows);
  const operations = posts.map(post => {
    const postId = post._id.toString();
    return {
      updateOne: {
        filter: { _id: post._id },
        update: {
          $set: {
            likesCount: likesByPost.get(postId) || 0,
            commentsCount: commentsByPost.get(postId) || 0,
          },
        },
      },
    };
  });

  if (operations.length > 0) {
    await Post.bulkWrite(operations, { ordered: false });
  }

  console.log(`Recalculated engagement counters for ${operations.length} posts`);
};

run()
  .catch(() => {
    console.error('Engagement counter backfill failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
