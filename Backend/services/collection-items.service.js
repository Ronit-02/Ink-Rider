const mongoose = require('mongoose');
const Collection = require('../schemas/collection.schema');
const Post = require('../schemas/post.schema');

// Keep legacy post arrays readable while converting only the collection being edited.
const orderedItems = { $cond: [
  { $gt: [{ $size: { $ifNull: ['$items', []] } }, 0] },
  '$items',
  { $map: { input: { $range: [0, { $size: { $ifNull: ['$posts', []] } }] }, as: 'index', in: {
    post: { $arrayElemAt: ['$posts', '$$index'] }, position: '$$index', addedAt: '$createdAt',
  } } },
] };

const appendCollectionPost = async ({ collectionId, postId, actorId }) => {
  const post = await Post.exists({ _id: postId, publicationStatus: { $ne: 'unpublished' },
    $or: [{ publicAt: { $lte: new Date() } }, { publicAt: null }, { publicAt: { $exists: false } }],
  });
  if (!post) return { status: 404, message: 'This story is not publicly available' };
  const postObjectId = new mongoose.Types.ObjectId(postId);
  const updated = await Collection.findOneAndUpdate({
    _id: collectionId, author: actorId,
    $expr: { $and: [
      { $lt: [{ $size: orderedItems }, 100] },
      { $not: [{ $in: [postObjectId, { $map: { input: orderedItems, as: 'item', in: '$$item.post' } }] }] },
    ] },
  }, [
    { $set: { items: orderedItems } },
    { $set: { items: { $concatArrays: ['$items', [{
      post: { $literal: postObjectId },
      position: { $add: [{ $ifNull: [{ $max: '$items.position' }, -1] }, 1] },
      addedAt: '$$NOW',
    }]] }, posts: [] } },
  ], { returnDocument: 'after', updatePipeline: true }).select('_id');
  if (updated) return { status: 200, data: { added: true } };
  const collection = await Collection.findOne({ _id: collectionId, author: actorId }).select('items posts');
  if (!collection) return { status: 404, message: 'Collection not found' };
  const ids = collection.items?.length ? collection.items.map(item => String(item.post)) : (collection.posts || []).map(String);
  if (ids.includes(postObjectId.toHexString())) return { status: 200, data: { added: false } };
  return { status: 400, message: 'A collection can contain up to 100 stories' };
};

module.exports = { appendCollectionPost };
