const User = require('../schemas/user.schema');
const Post = require('../schemas/post.schema');
const Save = require('../schemas/save.schema');

/* GET /api/user — fetch user by email */
const fetchUser = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).send({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).send({ message: 'Cannot fetch user' });
  }
};

/* PUT /api/user/profile — update own profile (auth required) */
const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send({ message: 'Not found' });

    if (username) {
      const taken = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (taken) return res.status(400).send({ message: 'Username already taken' });
      user.username = username;
    }
    if (bio !== undefined) user.bio = bio;
    await user.save();
    return res.status(200).json({ message: 'Profile updated' });
  } catch (err) {
    return res.status(500).send({ message: 'Error updating profile' });
  }
};

/* POST /api/user/follow/:id — toggle follow */
const toggleFollow = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id)
      return res.status(400).send({ message: 'Cannot follow yourself' });

    const me     = await User.findById(req.user._id);
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).send({ message: 'User not found' });

    const idx = me.following.findIndex(id => id.toString() === req.params.id);
    if (idx > -1) {
      me.following.splice(idx, 1);
      target.followers = Math.max(0, target.followers - 1);
    } else {
      me.following.push(req.params.id);
      target.followers += 1;
    }
    await me.save();
    await target.save();
    return res.status(200).json({ following: idx === -1, followers: target.followers });
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

/* POST /api/user/bookmark/:postId — toggle bookmark */
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if(!user) return res.status(404).json({ message: 'User not found' });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    console.log('Toggling bookmark for user ', user?.username, ' on post ', post?.title);

    const existingSave = await Save.findOne({ userId: user._id, postId: post._id });
    if (existingSave) {
      await Save.deleteOne({ userId: user._id, postId: post._id });
    }
    else{
      await Save.create({ userId: user._id, postId: post._id });
    }
      
    return res.status(200).json({ 
      success: true, 
      isBookmarked: !existingSave 
    });
  } 
  catch (err) {
    console.log('Error toggling bookmark - ', err);
    return res.status(500).json({ 
      success: false,
      message: 'Error toggling bookmark' 
    });
  }
};

/* GET /api/user/bookmarks — get user's saved posts */
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'saved',
      populate: { path: 'author', select: 'picture username' },
    });
    return res.status(200).json(user.saved);
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

/* GET /api/user/analytics — basic analytics for current user */
const getAnalytics = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).select('title metadata createdAt');
    const totalViews = posts.reduce((sum, p) => sum + (p.metadata?.views || 0), 0);
    return res.status(200).json({
      totalPosts:  posts.length,
      totalViews,
      posts: posts.map(p => ({ id: p._id, title: p.title, views: p.metadata?.views || 0, date: p.createdAt })),
    });
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

/* POST /api/user/like/:postId — toggle like on a post */
const toggleLike = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send({ message: 'Post not found' });
    const idx = user.liked.findIndex(id => id.toString() === req.params.postId);
    if (idx > -1) { user.liked.splice(idx, 1); post.likes = Math.max(0, post.likes - 1); }
    else           { user.liked.push(req.params.postId); post.likes += 1; }
    await user.save();
    await post.save();
    return res.status(200).json({ liked: idx === -1, likes: post.likes });
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

/* POST /api/user/comment/:postId — add comment to post */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).send({ message: 'Comment text required' });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send({ message: 'Post not found' });
    post.comments.push({ comment: text, author: req.user._id });
    await post.save();
    return res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    return res.status(500).send({ message: 'Error adding comment' });
  }
};

module.exports = { fetchUser, updateProfile, toggleFollow, toggleBookmark, getBookmarks, getAnalytics, toggleLike, addComment };
