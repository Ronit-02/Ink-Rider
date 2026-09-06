const Profile = require('../schemas/profile.schema');
const Like = require('../schemas/like.schema');
const Save = require('../schemas/save.schema');

const extractText = body => {
  try {
    const blocks = JSON.parse(body);
    if (!Array.isArray(blocks)) return '';
    return blocks
      .filter(block => !['image', 'divider'].includes(block?.type))
      .map(block => String(block.content || '').replace(/<[^>]*>/g, ' '))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
};

const presentDiscoveryPosts = async (posts, viewerId = null) => {
  const authorIds = posts.map(post => post.author?._id).filter(Boolean);
  const postIds = posts.map(post => post._id).filter(Boolean);
  const [profiles, likes, saves] = await Promise.all([
    Profile.find({ userId: { $in: authorIds } }).select('userId handle displayName avatarUrl'),
    viewerId ? Like.find({ userId: viewerId, postId: { $in: postIds } }).select('postId') : [],
    viewerId ? Save.find({ userId: viewerId, postId: { $in: postIds } }).select('postId') : [],
  ]);
  const profilesByUser = new Map(
    profiles.map(profile => [profile.userId.toString(), profile])
  );
  const likedPostIds = new Set(likes.map(like => like.postId.toString()));
  const savedPostIds = new Set(saves.map(save => save.postId.toString()));

  return posts.map(post => {
    const text = extractText(post.body);
    const words = text ? text.split(/\s+/).length : 0;
    const profile = post.author?._id
      ? profilesByUser.get(post.author._id.toString())
      : null;

    return {
      id: post._id,
      title: post.title,
      image: post.coverImage || null,
      excerpt: text.slice(0, 220),
      tags: post.tags || [],
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      isLiked: likedPostIds.has(post._id.toString()),
      isBookmarked: savedPostIds.has(post._id.toString()),
      createdAt: post.createdAt,
      readTime: `${Math.max(1, Math.ceil(words / 200))} min read`,
      author: {
        id: post.author?._id || null,
        username: profile?.displayName || post.author?.username || 'Unknown writer',
        picture: profile?.avatarUrl || post.author?.picture || null,
        handle: profile?.handle || null,
      },
    };
  });
};

module.exports = { presentDiscoveryPosts };
