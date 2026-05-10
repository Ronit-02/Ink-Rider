const Collection = require('../schemas/collection.schema');

/* GET /api/collection — list public collections, optional author filter */
const getCollections = async (req, res) => {
  try {
    const { authorId } = req.query;
    const filter = { isPublic: true };
    if (authorId) filter.author = authorId;

    const collections = await Collection.find(filter)
      .populate({ path: 'author', select: 'picture username' })
      .populate({ path: 'posts',  select: 'title coverImage' })
      .sort({ createdAt: -1 });

    return res.status(200).json(collections);
  } catch (err) {
    return res.status(500).send({ message: 'Error fetching collections' });
  }
};

/* GET /api/collection/:id — single collection with all posts */
const getCollectionById = async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id)
      .populate({ path: 'author', select: 'picture username email' })
      .populate({ path: 'posts',  populate: { path: 'author', select: 'picture username' } });

    if (!col) return res.status(404).send({ message: 'Collection not found' });
    return res.status(200).json(col);
  } catch (err) {
    return res.status(500).send({ message: 'Error fetching collection' });
  }
};

/* POST /api/collection — create a new collection (auth required) */
const createCollection = async (req, res) => {
  try {
    const { title, description, posts, isPublic } = req.body;
    if (!title) return res.status(400).send({ message: 'Title is required' });

    const col = new Collection({
      title,
      description: description || '',
      author: req.user._id,
      posts: posts || [],
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    await col.save();
    return res.status(201).json({ message: 'Collection created', collectionId: col._id });
  } catch (err) {
    return res.status(500).send({ message: 'Error creating collection' });
  }
};

/* PUT /api/collection/:id — update (owner only) */
const updateCollection = async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) return res.status(404).send({ message: 'Collection not found' });
    if (col.author.toString() !== req.user._id.toString())
      return res.status(403).send({ message: 'Not authorised' });

    const { title, description, posts, isPublic } = req.body;
    if (title)       col.title       = title;
    if (description) col.description = description;
    if (posts)       col.posts       = posts;
    if (isPublic !== undefined) col.isPublic = isPublic;
    await col.save();
    return res.status(200).json({ message: 'Collection updated' });
  } catch (err) {
    return res.status(500).send({ message: 'Error updating collection' });
  }
};

/* DELETE /api/collection/:id */
const deleteCollection = async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) return res.status(404).send({ message: 'Not found' });
    if (col.author.toString() !== req.user._id.toString())
      return res.status(403).send({ message: 'Not authorised' });
    await col.deleteOne();
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).send({ message: 'Error deleting collection' });
  }
};

/* POST /api/collection/:id/save — toggle save */
const toggleSave = async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) return res.status(404).send({ message: 'Not found' });
    const uid = req.user._id.toString();
    const idx = col.savedBy.findIndex(id => id.toString() === uid);
    if (idx > -1) col.savedBy.splice(idx, 1);
    else          col.savedBy.push(req.user._id);
    await col.save();
    return res.status(200).json({ saved: idx === -1 });
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

module.exports = { getCollections, getCollectionById, createCollection, updateCollection, deleteCollection, toggleSave };
