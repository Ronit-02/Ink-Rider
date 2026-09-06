const mongoose = require('mongoose');
const config = require('../config/config.js');
const Post = require('../schemas/post.schema');
const { publicPostClause } = require('../services/post-access.service');

const run = async () => {
  const username = encodeURIComponent(config.MONGO_USERNAME || '');
  const password = encodeURIComponent(config.MONGO_PASSWORD || '');
  const mongoUri = config.MONGO_URI || `mongodb+srv://${username}:${password}@cluster0.67xcpyv.mongodb.net/${config.DB_NAME}?appName=Cluster0`;
  await mongoose.connect(mongoUri);
  try {
    const post = await Post.findOne(publicPostClause()).sort({ publicAt: -1, _id: 1 }).select('_id').lean();
    if (!post) throw new Error('No public article is available for the SEO crawl');
    process.stdout.write(`/post/${post._id}\n`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
