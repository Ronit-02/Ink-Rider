const mongoose = require('mongoose');
const Post = require('../schemas/post.schema');
const Profile = require('../schemas/profile.schema');
const ShortSeries = require('../schemas/short-series.schema');
const { encodeCursor, decodeCursor } = require('../utils/cursor');

const isValidId = value => mongoose.isValidObjectId(value);
const orderedItems = series => [...series.items].sort((left, right) => left.position - right.position);

const present = async (seriesDocuments, actorId, includeItems = false) => {
  const authorIds = seriesDocuments.map(series => series.author?._id).filter(Boolean);
  const profiles = await Profile.find({ userId: { $in: authorIds } }).select('userId handle displayName avatarUrl');
  const byAuthor = new Map(profiles.map(profile => [profile.userId.toString(), profile]));
  return seriesDocuments.map(series => {
    const profile = series.author?._id ? byAuthor.get(series.author._id.toString()) : null;
    const items = orderedItems(series).filter(item => item.post);
    const data = {
      id: series._id,
      title: series.title,
      description: series.description,
      visibility: series.visibility,
      entriesCount: items.length,
      coverImage: items.find(item => item.post?.coverImage)?.post.coverImage || null,
      isOwner: actorId === series.author?._id?.toString(),
      createdAt: series.createdAt,
      author: {
        id: series.author?._id || null,
        username: profile?.displayName || series.author?.username || 'Unknown writer',
        picture: profile?.avatarUrl || series.author?.picture || null,
        handle: profile?.handle || null,
      },
    };
    if (includeItems) data.entries = items.map((item, index) => ({
      id: item.post._id,
      title: item.post.title,
      image: item.post.coverImage || null,
      position: index,
      createdAt: item.post.createdAt,
    }));
    return data;
  });
};

const validateInput = async (body, authorId, currentSeriesId = null) => {
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const visibility = body.visibility || 'public';
  const postIds = Array.isArray(body.postIds) ? body.postIds.map(String) : null;
  if (title.length < 2 || title.length > 100 || description.length > 500
    || !['public', 'unlisted', 'private'].includes(visibility)
    || !postIds || postIds.length < 2 || postIds.length > 50
    || new Set(postIds).size !== postIds.length || postIds.some(id => !isValidId(id))) {
    return { error: 'Invalid short series content' };
  }
  const posts = await Post.find({ _id: { $in: postIds }, author: authorId, format: 'short' }).select('_id');
  if (posts.length !== postIds.length) return { error: 'Series entries must be your published short posts' };
  const conflict = await ShortSeries.exists({
    ...(currentSeriesId ? { _id: { $ne: currentSeriesId } } : {}),
    'items.post': { $in: postIds },
  });
  if (conflict) return { error: 'A short post can belong to only one series' };
  return { value: { title, description, visibility, items: postIds.map((post, position) => ({ post, position })) } };
};

const listSeries = async (req, res) => {
  try {
    const mine = req.query.mine === 'true';
    if (mine && !req.auth) return res.status(401).json({ message: 'Sign in to view your series' });
    const cursor = req.query.cursor ? decodeCursor(req.query.cursor) : null;
    if (req.query.cursor && !cursor) return res.status(400).json({ message: 'Invalid series cursor' });
    const filter = mine ? { author: req.auth.userId } : { visibility: 'public' };
    if (cursor) {
      const createdAt = new Date(cursor.createdAt);
      if (!isValidId(cursor.id) || Number.isNaN(createdAt.getTime())) return res.status(400).json({ message: 'Invalid series cursor' });
      filter.$or = [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: cursor.id } }];
    }
    const documents = await ShortSeries.find(filter)
      .populate({ path: 'author', select: 'picture username' })
      .populate({ path: 'items.post', select: 'title coverImage createdAt' })
      .sort({ createdAt: -1, _id: -1 }).limit(13);
    const hasMore = documents.length > 12;
    const page = hasMore ? documents.slice(0, 12) : documents;
    const data = await present(page, req.auth?.userId);
    const last = page.at(-1);
    return res.status(200).json({ data, meta: { nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last._id.toString() }) : null } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load short series' });
  }
};

const getSeries = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid series id' });
  const series = await ShortSeries.findById(req.params.id)
    .populate({ path: 'author', select: 'picture username' })
    .populate({ path: 'items.post', select: 'title coverImage createdAt' });
  if (!series) return res.status(404).json({ message: 'Series not found' });
  const isOwner = req.auth?.userId === series.author._id.toString();
  if (series.visibility === 'private' && !isOwner) return res.status(404).json({ message: 'Series not found' });
  const [data] = await present([series], req.auth?.userId, true);
  return res.status(200).json({ data });
};

const getEligibleShorts = async (req, res) => {
  const used = await ShortSeries.find({ author: req.auth.userId }).distinct('items.post');
  const posts = await Post.find({ author: req.auth.userId, format: 'short', _id: { $nin: used } })
    .sort({ createdAt: -1 }).select('title coverImage createdAt');
  return res.status(200).json({ data: posts.map(post => ({ id: post._id, title: post.title, image: post.coverImage, createdAt: post.createdAt })) });
};

const createSeries = async (req, res) => {
  const parsed = await validateInput(req.body, req.auth.userId);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const series = await ShortSeries.create({ ...parsed.value, author: req.auth.userId });
  return res.status(201).json({ data: { seriesId: series._id } });
};

const updateSeries = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid series id' });
  const owner = await ShortSeries.exists({ _id: req.params.id, author: req.auth.userId });
  if (!owner) return res.status(404).json({ message: 'Owned series not found' });
  const parsed = await validateInput(req.body, req.auth.userId, req.params.id);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  await ShortSeries.updateOne({ _id: req.params.id, author: req.auth.userId }, { $set: parsed.value });
  return res.status(200).json({ data: { updated: true } });
};

module.exports = { listSeries, getSeries, getEligibleShorts, createSeries, updateSeries };
