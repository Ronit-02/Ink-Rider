const Competition = require('../schemas/competition.schema');

/* GET /api/competition — list competitions, optionally filtered by status */
const getCompetitions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const comps = await Competition.find(filter)
      .populate({ path: 'createdBy',       select: 'picture username' })
      .populate({ path: 'entries.author',  select: 'picture username' })
      .populate({ path: 'entries.post',    select: 'title coverImage' })
      .sort({ createdAt: -1 });
    return res.status(200).json(comps);
  } catch (err) {
    return res.status(500).send({ message: 'Error fetching competitions' });
  }
};

/* GET /api/competition/:id */
const getCompetitionById = async (req, res) => {
  try {
    const comp = await Competition.findById(req.params.id)
      .populate({ path: 'entries.author', select: 'picture username' })
      .populate({ path: 'entries.post',   populate: { path: 'author', select: 'picture username' } });
    if (!comp) return res.status(404).send({ message: 'Not found' });
    return res.status(200).json(comp);
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

/* POST /api/competition/:id/enter — submit an entry */
const enterCompetition = async (req, res) => {
  try {
    const { postId, note } = req.body;
    if (!postId) return res.status(400).send({ message: 'Post ID required' });

    const comp = await Competition.findById(req.params.id);
    if (!comp)              return res.status(404).send({ message: 'Not found' });
    if (comp.status !== 'open') return res.status(400).send({ message: 'Competition is not open' });

    // Prevent duplicate entries from same user
    const already = comp.entries.some(e => e.author.toString() === req.user._id.toString());
    if (already) return res.status(400).send({ message: 'Already entered' });

    comp.entries.push({ author: req.user._id, post: postId, note: note || '' });
    await comp.save();
    return res.status(201).json({ message: 'Entry submitted' });
  } catch (err) {
    return res.status(500).send({ message: 'Error entering competition' });
  }
};

/* POST /api/competition/:id/entries/:entryId/like — toggle like on entry */
const likeEntry = async (req, res) => {
  try {
    const comp = await Competition.findById(req.params.id);
    if (!comp) return res.status(404).send({ message: 'Not found' });
    const entry = comp.entries.id(req.params.entryId);
    if (!entry) return res.status(404).send({ message: 'Entry not found' });
    const uid = req.user._id.toString();
    const idx = entry.likes.findIndex(id => id.toString() === uid);
    if (idx > -1) entry.likes.splice(idx, 1);
    else          entry.likes.push(req.user._id);
    await comp.save();
    return res.status(200).json({ liked: idx === -1, count: entry.likes.length });
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

module.exports = { getCompetitions, getCompetitionById, enterCompetition, likeEntry };
