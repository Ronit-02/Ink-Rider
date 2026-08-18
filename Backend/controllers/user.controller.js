const User = require('../schemas/user.schema');
const Post = require('../schemas/post.schema');
const Save = require('../schemas/save.schema');
const Like = require('../schemas/like.schema');
const Follow = require('../schemas/follow.schema');
const Comment = require('../schemas/comment.schema');
const Profile = require('../schemas/profile.schema');
const mongoose = require('mongoose');
const { createProfileForUser } = require('../services/profile.service');
const InteractionEvent = require('../schemas/interaction-event.schema');
const { hasCapability } = require('../services/entitlement.service');
const { toggleFollow: toggleFollowWorkflow, toggleSave: toggleSaveWorkflow } = require('../services/user-relationship.service');
const { setLike, addComment: addCommentWorkflow } = require('../services/engagement.service');

const isValidId = (id) => mongoose.isValidObjectId(id);

const getMe = async (req, res) => {
  try {
    const [user, profile, postCount] = await Promise.all([
      User.findById(req.auth.userId).select('username picture bio role followersCount followingCount createdAt'),
      Profile.findOne({ userId: req.auth.userId }).select('handle displayName bio avatarUrl websiteUrl writerStatus membershipEnabled directRequestsEnabled'),
      Post.countDocuments({ author: req.auth.userId }),
    ]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        displayName: profile?.displayName || user.username,
        handle: profile?.handle || null,
        bio: profile?.bio ?? user.bio ?? '',
        avatarUrl: profile?.avatarUrl || user.picture || null,
        websiteUrl: profile?.websiteUrl || null,
        writerStatus: profile?.writerStatus || 'reader',
        membershipEnabled: Boolean(profile?.membershipEnabled),
        directRequestsEnabled: Boolean(profile?.directRequestsEnabled),
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        postCount,
        joinedAt: user.createdAt,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Unable to load your profile' });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.auth.userId })
      .select('title coverImage format tags likesCount commentsCount metadata publicationStatus currentRevision publicAt createdAt')
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: posts });
  } catch {
    return res.status(500).json({ message: 'Unable to load your posts' });
  }
};

/* GET /api/user — fetch a public user profile */
const fetchUser = async (req, res) => {
  try {
    const { id, username } = req.query;
    if (!id && !username) {
      return res.status(400).json({ message: 'User id or username is required' });
    }
    if (id && !isValidId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const query = id ? { _id: id } : { username };
    const user = await User.findOne(query)
      .select('picture username bio followersCount followingCount role createdAt');
    if (!user) return res.status(404).send({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).send({ message: 'Cannot fetch user' });
  }
};

/* PUT /api/user/profile — update own profile (auth required) */
const updateProfile = async (req, res) => {
  try {
    const { username, bio, directRequestsEnabled } = req.body;
    const userId = req.auth.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: 'Not found' });

    if (username) {
      const taken = await User.findOne({ username, _id: { $ne: userId } });
      if (taken) return res.status(400).send({ message: 'Username already taken' });
      user.username = username;
    }
    if (bio !== undefined) user.bio = bio;
    await user.save();

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = await createProfileForUser({
        userId,
        username: user.username,
        picture: user.picture,
        bio: user.bio,
      });
    } else {
      if (username) profile.displayName = user.username;
      if (bio !== undefined) profile.bio = user.bio;
      if (typeof directRequestsEnabled === 'boolean') profile.directRequestsEnabled = directRequestsEnabled;
      await profile.save();
    }

    return res.status(200).json({
      message: 'Profile updated',
      profile: {
        handle: profile.handle,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        directRequestsEnabled: profile.directRequestsEnabled,
      },
    });
  } catch (err) {
    return res.status(500).send({ message: 'Error updating profile' });
  }
};

/* POST /api/user/follow/:id — toggle follow */
const toggleFollow = async (req, res) => {
  try {
    const followerId = req.auth.userId;
    const followingId = req.params.id;

    if (!isValidId(followingId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (followerId === followingId)
      return res.status(400).send({ message: 'Cannot follow yourself' });

    const [me, target] = await Promise.all([
      User.findById(followerId).select('_id'),
      User.findById(followingId).select('_id followersCount'),
    ]);
    if (!me) return res.status(401).send({ message: 'User not found' });
    if (!target) return res.status(404).send({ message: 'User not found' });

    return res.status(200).json(await toggleFollowWorkflow({ followerId, followingId }));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).send({ message: 'Follow state already changed' });
    }
    return res.status(500).send({ message: 'Error' });
  }
};

/* POST /api/user/bookmark/:postId — toggle bookmark */
const toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!isValidId(postId)) return res.status(400).json({ message: 'Invalid post id' });

    const user = await User.findById(req.auth.userId);
    if(!user) return res.status(404).json({ message: 'User not found' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    return res.status(200).json({ success: true, ...(await toggleSaveWorkflow({ userId: user._id, postId: post._id })) });
  } 
  catch (err) {
    console.error(`[${req.requestId}] Bookmark mutation failed`);
    return res.status(500).json({ 
      success: false,
      message: 'Error toggling bookmark' 
    });
  }
};

/* GET /api/user/bookmarks — get user's saved posts */
const getBookmarks = async (req, res) => {
  try {
    const saves = await Save.find({ userId: req.auth.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'postId',
        populate: { path: 'author', select: 'picture username bio' },
      });
    return res.status(200).json(saves.map(save => save.postId).filter(Boolean));
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

/* GET /api/user/analytics — basic analytics for current user */
const getAnalytics = async (req, res) => {
  try {
    if (!await hasCapability(req.auth.userId, 'writer_analytics')) {
      return res.status(403).json({ code: 'ENTITLEMENT_REQUIRED', message: 'Writer analytics require an active membership' });
    }
    const posts = await Post.find({ author: req.auth.userId }).select('title likesCount commentsCount createdAt');
    const postIds = posts.map(post => post._id);
    const grouped = await InteractionEvent.aggregate([
      { $match: { postId: { $in: postIds }, eventType: { $in: ['open', 'complete'] } } },
      { $group: { _id: { postId: '$postId', eventType: '$eventType' }, count: { $sum: 1 } } },
    ]);
    const eventCounts = new Map(grouped.map(item => [`${item._id.postId}:${item._id.eventType}`, item.count]));
    const rows = posts.map(post => ({
      id: post._id,
      title: post.title,
      opens: eventCounts.get(`${post._id}:open`) || 0,
      completions: eventCounts.get(`${post._id}:complete`) || 0,
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      date: post.createdAt,
    }));
    const totalViews = rows.reduce((sum, post) => sum + post.opens, 0);
    const totalCompletions = rows.reduce((sum, post) => sum + post.completions, 0);
    return res.status(200).json({
      data: {
        totalPosts: posts.length,
        totalViews,
        totalCompletions,
        completionRate: totalViews ? Math.round((totalCompletions / totalViews) * 1000) / 10 : 0,
        posts: rows.sort((left, right) => right.opens - left.opens),
      },
    });
  } catch (err) {
    return res.status(500).send({ message: 'Unable to load writer analytics' });
  }
};

/* POST /api/user/like/:postId — toggle like on a post */
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!isValidId(postId)) return res.status(400).json({ message: 'Invalid post id' });

    const post = await Post.findById(postId).select('_id likesCount');
    if (!post) return res.status(404).send({ message: 'Post not found' });

    const userId = req.auth.userId;
    const liked = !(await Like.exists({ userId, postId }));
    const result = await setLike({ postId, userId, liked });
    return res.status(200).json({ liked: result.isLiked, likesCount: result.likesCount });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).send({ message: 'Like state already changed' });
    }
    return res.status(500).send({ message: 'Error' });
  }
};

/* POST /api/user/comment/:postId — add comment to post */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).send({ message: 'Comment text required' });
    const content = text.trim();
    if (!content) return res.status(400).send({ message: 'Comment text required' });
    if (content.length > 1000) return res.status(400).send({ message: 'Comment is too long' });
    if (!isValidId(req.params.postId)) return res.status(400).send({ message: 'Invalid post id' });

    const post = await Post.findById(req.params.postId).select('_id');
    if (!post) return res.status(404).send({ message: 'Post not found' });

    const comment = await addCommentWorkflow({ postId: post._id, userId: req.auth.userId, content });
    return res.status(201).json({ message: 'Comment added', commentId: comment.id });
  } catch (err) {
    return res.status(500).send({ message: 'Error adding comment' });
  }
};

module.exports = { getMe, getMyPosts, fetchUser, updateProfile, toggleFollow, toggleBookmark, getBookmarks, getAnalytics, toggleLike, addComment };
