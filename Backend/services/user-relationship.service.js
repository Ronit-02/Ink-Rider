const Follow = require('../schemas/follow.schema');
const User = require('../schemas/user.schema');
const Save = require('../schemas/save.schema');
const { withTransaction } = require('../utils/transaction');

const toggleFollow = ({ followerId, followingId }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  const existing = await Follow.findOne({ followerId, followingId }).session(session);
  if (existing) {
    await Follow.deleteOne({ _id: existing._id }, options);
    await User.updateOne({ _id: followerId, followingCount: { $gt: 0 } }, { $inc: { followingCount: -1 } }, options);
    await User.updateOne({ _id: followingId, followersCount: { $gt: 0 } }, { $inc: { followersCount: -1 } }, options);
    const target = await User.findById(followingId).select('followersCount').session(session);
    return { following: false, followersCount: target?.followersCount || 0 };
  }
  await Follow.create([{ followerId, followingId }], options);
  await User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } }, options);
  await User.updateOne({ _id: followingId }, { $inc: { followersCount: 1 } }, options);
  const target = await User.findById(followingId).select('followersCount').session(session);
  return { following: true, followersCount: target?.followersCount || 0 };
});

const toggleSave = ({ userId, postId }) => withTransaction(async session => {
  const options = session ? { session } : undefined;
  const existing = await Save.findOne({ userId, postId }).session(session);
  if (existing) {
    await Save.deleteOne({ _id: existing._id }, options);
    return { isBookmarked: false };
  }
  await Save.create([{ userId, postId }], options);
  return { isBookmarked: true };
});

module.exports = { toggleFollow, toggleSave };
