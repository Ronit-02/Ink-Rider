const mongoose = require('mongoose');
const Follow = require('../schemas/follow.schema');
const Profile = require('../schemas/profile.schema');
const Topic = require('../schemas/topic.schema');
const User = require('../schemas/user.schema');
const UserInterest = require('../schemas/user-interest.schema');
const { saveOnboardingSelection, resetInferredInterests: resetInterests } = require('../services/onboarding.service');

const getOnboarding = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const [topics, interests, profiles, follows, user] = await Promise.all([
      Topic.find({ status: 'active' }).sort({ order: 1, slug: 1 }).select('slug displayName description'),
      UserInterest.find({ userId, explicitWeight: { $gt: 0 } }).populate('topicId', 'slug'),
      Profile.find({ userId: { $ne: userId }, writerStatus: 'writer' })
        .select('userId handle displayName bio avatarUrl')
        .populate({ path: 'userId', select: 'followersCount' })
        .limit(24),
      Follow.find({ followerId: userId }).select('followingId'),
      User.findById(userId).select('onboardingCompletedAt'),
    ]);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const suggestedWriters = profiles
      .filter(profile => profile.userId)
      .sort((left, right) => (right.userId.followersCount || 0) - (left.userId.followersCount || 0))
      .slice(0, 8)
      .map(profile => ({
        id: profile.userId._id,
        handle: profile.handle,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        followersCount: profile.userId.followersCount || 0,
      }));

    return res.status(200).json({
      data: {
        topics,
        selectedTopicSlugs: interests.map(interest => interest.topicId?.slug).filter(Boolean),
        suggestedWriters,
        followedWriterIds: follows.map(follow => follow.followingId.toString()),
        completed: Boolean(user.onboardingCompletedAt),
      },
    });
  } catch (error) {
    console.error(`[${req.requestId}] Onboarding options failed`);
    return res.status(500).json({ message: 'Unable to load onboarding' });
  }
};

const saveOnboarding = async (req, res) => {
  try {
    const topicSlugs = req.body?.topicSlugs;
    const writerIds = req.body?.writerIds;
    const completed = req.body?.completed;
    if (!Array.isArray(topicSlugs) || !Array.isArray(writerIds) || typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Invalid onboarding payload' });
    }
    const uniqueTopicSlugs = [...new Set(topicSlugs.map(value => String(value).trim().toLowerCase()))];
    const uniqueWriterIds = [...new Set(writerIds.map(String))];
    if (uniqueTopicSlugs.length > 16 || uniqueWriterIds.length > 8
      || uniqueTopicSlugs.some(slug => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      || uniqueWriterIds.some(id => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: 'Invalid onboarding selection' });
    }
    if (uniqueWriterIds.includes(req.auth.userId)) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const [topics, writers] = await Promise.all([
      Topic.find({ slug: { $in: uniqueTopicSlugs }, status: 'active' }).select('_id slug'),
      User.find({ _id: { $in: uniqueWriterIds } }).select('_id'),
    ]);
    if (topics.length !== uniqueTopicSlugs.length) {
      return res.status(400).json({ message: 'One or more topics are unavailable' });
    }
    if (writers.length !== uniqueWriterIds.length) {
      return res.status(400).json({ message: 'One or more writers are unavailable' });
    }

    const result = await saveOnboardingSelection({ userId: req.auth.userId, topics, writers, completed });
    if (!result) return res.status(401).json({ message: 'User not found' });

    return res.status(200).json({
      data: {
        ...result,
      },
    });
  } catch (error) {
    console.error(`[${req.requestId}] Onboarding save failed`);
    return res.status(500).json({ message: 'Unable to save onboarding' });
  }
};

const resetInferredInterests = async (req, res) => {
  try {
    return res.status(200).json({ data: await resetInterests({ userId: req.auth.userId }) });
  } catch (error) {
    console.error(`[${req.requestId}] Inferred interest reset failed`);
    return res.status(500).json({ message: 'Unable to reset inferred interests' });
  }
};

module.exports = { getOnboarding, saveOnboarding, resetInferredInterests };
