require('dotenv').config();
const mongoose = require('mongoose');
const Collection = require('../schemas/collection.schema');
const { connectToMongoDB } = require('../utils/mongoConnect');

const run = async () => {
  await connectToMongoDB();
  const collections = await Collection.find().select('posts items isPublic visibility savedBy savedCount followers followersCount');
  let updated = 0;
  for (const collection of collections) {
    const changes = {
      visibility: collection.isPublic === false ? 'private' : (collection.visibility || 'public'),
      savedCount: new Set((collection.savedBy || []).map(String)).size,
      followersCount: new Set((collection.followers || []).map(String)).size,
    };
    if (!collection.items?.length && collection.posts?.length) {
      changes.items = collection.posts.map((post, position) => ({ post, position, addedAt: collection.createdAt || new Date() }));
      changes.posts = [];
    }
    await Collection.updateOne({ _id: collection._id }, { $set: changes });
    updated += 1;
  }
  console.log(`Migrated ${updated} collections`);
};

run()
  .catch(error => {
    console.error('Collection migration failed');
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
