const Follow = require('../schemas/follow.schema');
const User = require('../schemas/user.schema');
const UserInterest = require('../schemas/user-interest.schema');
const { withTransaction } = require('../utils/transaction');

const saveOnboardingSelection = async ({ userId, topics, writers, completed }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  const selectedTopicIds = topics.map(topic => topic._id);
  await UserInterest.updateMany({ userId, topicId: { $nin: selectedTopicIds } }, { $set: { explicitWeight: 0 } }, options);
  if (topics.length) {
    await UserInterest.bulkWrite(topics.map(topic => ({
      updateOne: {
        filter: { userId, topicId: topic._id },
        update: { $set: { explicitWeight: 1 }, $setOnInsert: { inferredWeight: 0 } },
        upsert: true,
      },
    })), options);
  }
  await UserInterest.deleteMany({ userId, explicitWeight: 0, inferredWeight: 0 }, options);

  const followResult = writers.length ? await Follow.bulkWrite(writers.map(writer => ({
    updateOne: {
      filter: { followerId: userId, followingId: writer._id },
      update: { $setOnInsert: { followerId: userId, followingId: writer._id } },
      upsert: true,
    },
  })), options) : { upsertedCount: 0, upsertedIds: {} };
  const addedIds = Object.values(followResult.upsertedIds || {});
  if (addedIds.length) {
    const addedRelationships = await Follow.find({ _id: { $in: addedIds } }).select('followingId').session(session);
    await User.updateOne({ _id: userId }, { $inc: { followingCount: addedRelationships.length } }, options);
    await Promise.all(addedRelationships.map(follow => User.updateOne(
      { _id: follow.followingId }, { $inc: { followersCount: 1 } }, options,
    )));
  }
  const user = await User.findByIdAndUpdate(userId, completed ? { $set: { onboardingCompletedAt: new Date() } } : {}, { returnDocument: 'after', ...options }).select('onboardingCompletedAt');
  if (!user) return null;
  return { selectedTopicSlugs: topics.map(topic => topic.slug), addedFollows: followResult.upsertedCount || 0, completed: Boolean(user.onboardingCompletedAt) };
});

const resetInferredInterests = ({ userId }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  await UserInterest.updateMany({ userId, inferredWeight: { $gt: 0 } }, { $set: { inferredWeight: 0 } }, options);
  await UserInterest.deleteMany({ userId, explicitWeight: 0, inferredWeight: 0 }, options);
  return { reset: true };
});

module.exports = { saveOnboardingSelection, resetInferredInterests };
