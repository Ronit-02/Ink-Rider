const mongoose = require('mongoose');
const config = require('../config/config.js');
const Post = require('../schemas/post.schema');
const { publicPostClause } = require('../services/post-access.service');

const run = async () => {
  const username = encodeURIComponent(config.MONGO_USERNAME || '');
  const password = encodeURIComponent(config.MONGO_PASSWORD || '');
  const mongoUri = config.MONGO_URI || `mongodb+srv://${username}:${password}@${config.MONGO_HOST}/${encodeURIComponent(config.DB_NAME)}?retryWrites=true&w=majority`;
  await mongoose.connect(mongoUri);
  try {
    const post = await Post.findOne(publicPostClause()).sort({ publicAt: -1, _id: 1 }).select('_id').lean();
    if (!post) throw new Error('No public article is available for the SEO crawl');
    process.stdout.write(`/post/${post._id}\n`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(() => {
  console.error('Unable to select a public article for the SEO crawl');
  process.exitCode = 1;
});
