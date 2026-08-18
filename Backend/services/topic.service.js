const Topic = require('../schemas/topic.schema');
const canonicalTopics = require('../data/canonical-topics');

const ensureCanonicalTopics = async () => {
  await Topic.bulkWrite(canonicalTopics.map(topic => ({
    updateOne: {
      filter: { slug: topic.slug },
      update: { $set: topic },
      upsert: true,
    },
  })));
};

module.exports = { ensureCanonicalTopics };
