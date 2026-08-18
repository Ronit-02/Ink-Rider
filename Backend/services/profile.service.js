const Profile = require('../schemas/profile.schema');
const { normalizeHandle, buildHandleCandidate } = require('../utils/handle');

const createProfileForUser = async ({ userId, username, picture, bio = '' }) => {
  const existing = await Profile.findOne({ userId });
  if (existing) return existing;

  const baseHandle = normalizeHandle(username);
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const handle = buildHandleCandidate(baseHandle, attempt);
    try {
      return await Profile.create({
        userId,
        handle,
        displayName: username.trim(),
        bio,
        avatarUrl: picture || null,
      });
    } catch (error) {
      if (error?.code === 11000 && error?.keyPattern?.handle) continue;
      if (error?.code === 11000 && error?.keyPattern?.userId) {
        return Profile.findOne({ userId });
      }
      throw error;
    }
  }

  throw new Error('Unable to allocate a unique writer handle');
};

module.exports = { createProfileForUser };
