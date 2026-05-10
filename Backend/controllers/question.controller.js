const Question = require('../schemas/question.schema');

/* GET /api/question — list questions, sort by upvotes/newest */
const getQuestions = async (req, res) => {
  try {
    const { sort = 'hot' } = req.query;
    let sortOpt = {};
    if (sort === 'newest') sortOpt = { createdAt: -1 };
    else sortOpt = { 'upvotes.length': -1, createdAt: -1 }; // 'hot' = most upvotes

    const questions = await Question.find()
      .populate({ path: 'author',   select: 'picture username' })
      .populate({ path: 'relatedArticles', select: 'title coverImage' })
      .sort(sortOpt)
      .limit(50);

    return res.status(200).json(questions);
  } catch (err) {
    return res.status(500).send({ message: 'Error fetching questions' });
  }
};

/* POST /api/question — ask a new question */
const createQuestion = async (req, res) => {
  try {
    const { text, context, tags } = req.body;
    if (!text) return res.status(400).send({ message: 'Question text required' });

    const q = new Question({
      text,
      context: context || '',
      tags:    tags || [],
      author:  req.user._id,
    });
    await q.save();
    return res.status(201).json({ message: 'Question posted', questionId: q._id });
  } catch (err) {
    return res.status(500).send({ message: 'Error creating question' });
  }
};

/* POST /api/question/:id/upvote — toggle upvote */
const upvoteQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).send({ message: 'Not found' });
    const uid = req.user._id.toString();
    const idx = q.upvotes.findIndex(id => id.toString() === uid);
    if (idx > -1) q.upvotes.splice(idx, 1);
    else          q.upvotes.push(req.user._id);
    await q.save();
    return res.status(200).json({ upvoted: idx === -1, count: q.upvotes.length });
  } catch (err) {
    return res.status(500).send({ message: 'Error' });
  }
};

/* POST /api/question/:id/answer — post an answer */
const postAnswer = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).send({ message: 'Answer text required' });
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).send({ message: 'Not found' });
    q.answers.push({ text, author: req.user._id });
    await q.save();
    return res.status(201).json({ message: 'Answer posted' });
  } catch (err) {
    return res.status(500).send({ message: 'Error posting answer' });
  }
};

module.exports = { getQuestions, createQuestion, upvoteQuestion, postAnswer };
