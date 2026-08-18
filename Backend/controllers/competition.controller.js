const mongoose = require('mongoose');
const Competition = require('../schemas/competition.schema');
const Post = require('../schemas/post.schema');
const CompetitionAudit = require('../schemas/competition-audit.schema');
const CompetitionAppeal = require('../schemas/competition-appeal.schema');
const { getVoteRisk, getVoteSignals, recordVoteSignal, removeVoteSignal } = require('../services/competition-fraud.service');
const { notify } = require('../services/notification.service');
const { publicPostClause } = require('../services/post-access.service');
const { rankCompetitionEntries } = require('../services/competition-scoring.service');

const isValidId = id => mongoose.isValidObjectId(id);
const effectiveStatus = (competition, now = new Date()) => {
  if (competition.status === 'closed') return 'closed';
  if (competition.openDate > now) return 'draft';
  if (competition.closeDate > now) return 'open';
  if (competition.resultsDate && competition.resultsDate <= now) return 'closed';
  return 'judging';
};
const isVotingOpen = (competition, now = new Date()) => {
  const status = effectiveStatus(competition, now);
  return ['open', 'judging'].includes(status) && (!competition.resultsDate || competition.resultsDate > now);
};
const competitionStatusCandidates = status => ({
  draft: ['open'],
  open: ['open'],
  judging: ['open', 'judging'],
  closed: ['judging', 'closed'],
}[status] || []);
const canScoreEntry = (competition, entry, now = new Date()) => {
  const status = effectiveStatus(competition, now);
  if (status === 'closed') return { allowed: false, reason: 'COMPETITION_CLOSED' };
  if (entry.status === 'disqualified') return { allowed: false, reason: 'ENTRY_DISQUALIFIED' };
  if (status !== 'judging') return { allowed: false, reason: 'COMPETITION_NOT_JUDGING' };
  return { allowed: true, reason: null };
};
const canPublishResults = (competition, now = new Date()) => effectiveStatus(competition, now) === 'judging';
const canVoteEntry = (competition, entry, actorId, now = new Date()) => {
  if (!isVotingOpen(competition, now)) return { allowed: false, reason: 'VOTING_CLOSED' };
  if (competition.votingMode === 'judges') return { allowed: false, reason: 'VOTING_CLOSED' };
  if (entry.status === 'disqualified') return { allowed: false, reason: 'ENTRY_DISQUALIFIED' };
  if (entry.author?.toString() === actorId) return { allowed: false, reason: 'SELF_VOTE' };
  if ((entry.likes || []).some(id => id.toString() === actorId)) return { allowed: false, reason: 'ALREADY_VOTED' };
  return { allowed: true, reason: null };
};
const estimateReadTime = body => {
  try {
    const blocks = JSON.parse(body);
    const words = Array.isArray(blocks)
      ? blocks.reduce((count, block) => count + String(block?.content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length, 0)
      : 0;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  } catch {
    return '1 min read';
  }
};
const extractFirstImage = body => {
  try {
    const blocks = JSON.parse(body);
    if (!Array.isArray(blocks)) return null;
    const image = blocks.find(block => block?.type === 'image' && typeof block.content === 'string');
    if (!image) return null;
    const url = new URL(image.content);
    return ['http:', 'https:'].includes(url.protocol) ? image.content : null;
  } catch {
    return null;
  }
};

const presentCompetition = (competition, actorId, includeEntries = false) => {
  const status = effectiveStatus(competition);
  const data = {
    id: competition._id,
    title: competition.title,
    description: competition.description,
    coverImage: competition.coverImage,
    status,
    openDate: competition.openDate,
    closeDate: competition.closeDate,
    resultsDate: competition.resultsDate,
    votingMode: competition.votingMode,
    competitionType: competition.competitionType,
    rules: competition.rules,
    prizes: competition.prizes,
    entriesCount: competition.entries.length,
    isEntered: actorId ? competition.entries.some(entry => entry.author?._id?.toString() === actorId || entry.author?.toString() === actorId) : false,
  };
  if (includeEntries) {
    const ranking = rankCompetitionEntries(competition.entries, competition.votingMode);
    const rankingById = new Map(ranking.map(item => [item.id, item]));
    data.entries = competition.entries.map(entry => {
      const ranked = rankingById.get(entry._id.toString());
      return ({
      id: entry._id,
      note: entry.note,
      likesCount: entry.likesCount || entry.likes?.length || 0,
      score: ranked?.score ?? null,
      rank: ranked?.rank ?? null,
      judgeScore: ranked?.judgeScore ?? 0,
      status: entry.status,
      disqualificationReason: entry.disqualificationReason || null,
      isVoted: actorId ? entry.likes.some(id => id.toString() === actorId) : false,
      isWinner: competition.winnerEntryIds.some(id => id.toString() === entry._id.toString()),
      author: entry.author,
      post: entry.post ? {
        _id: entry.post._id,
        title: entry.post.title,
        coverImage: entry.post.coverImage || extractFirstImage(entry.post.body),
        createdAt: entry.post.createdAt,
        readTime: estimateReadTime(entry.post.body),
        likesCount: entry.post.likesCount || 0,
        commentsCount: entry.post.commentsCount || 0,
      } : null,
      createdAt: entry.createdAt,
      });
    }).sort((left, right) => (left.rank === null) - (right.rank === null) || (left.rank || 0) - (right.rank || 0));
  }
  return data;
};

const getCompetitions = async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status) : null;
    if (status && !['draft', 'open', 'judging', 'closed'].includes(status)) return res.status(400).json({ message: 'Invalid competition status' });
    const competitions = await Competition.find(status ? { status: { $in: competitionStatusCandidates(status) } } : {})
      .sort({ closeDate: -1 })
      .limit(50);
    const filtered = status ? competitions.filter(item => effectiveStatus(item) === status) : competitions;
    return res.status(200).json({ data: filtered.map(item => presentCompetition(item, req.auth?.userId)) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load competitions' });
  }
};

const getCompetitionById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid competition id' });
    const competition = await Competition.findById(req.params.id)
      .populate({ path: 'entries.author', select: 'picture username' })
      .populate({ path: 'entries.post', match: publicPostClause(), select: 'title coverImage createdAt body likesCount commentsCount' });
    if (!competition) return res.status(404).json({ message: 'Competition not found' });
    return res.status(200).json({ data: presentCompetition(competition, req.auth?.userId, true) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load competition' });
  }
};

const getEligiblePosts = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid competition id' });
  const competition = await Competition.findById(req.params.id).select('entries status openDate closeDate');
  if (!competition) return res.status(404).json({ message: 'Competition not found' });
  if (effectiveStatus(competition) !== 'open') return res.status(400).json({ message: 'Competition is not open' });
  const enteredPostIds = competition.entries.map(entry => entry.post);
  const posts = await Post.find({ author: req.auth.userId, _id: { $nin: enteredPostIds }, ...publicPostClause() })
    .sort({ createdAt: -1 }).select('title coverImage createdAt');
  return res.status(200).json({ data: posts.map(post => ({ id: post._id, title: post.title, image: post.coverImage, createdAt: post.createdAt })) });
};

const enterCompetition = async (req, res) => {
  try {
    const postId = req.body?.postId;
    const note = String(req.body?.note || '').trim();
    if (!isValidId(req.params.id) || !isValidId(postId) || note.length > 500) return res.status(400).json({ message: 'Invalid competition entry' });
    const post = await Post.findOne({ _id: postId, author: req.auth.userId, ...publicPostClause() }).select('_id currentRevision');
    if (!post) return res.status(403).json({ message: 'You can only enter your own post' });
    const now = new Date();
    const competition = await Competition.findOneAndUpdate(
      {
        _id: req.params.id, status: 'open', openDate: { $lte: now }, closeDate: { $gt: now },
        'entries.author': { $ne: req.auth.userId },
        $expr: { $lt: [{ $size: '$entries' }, '$maxEntries'] },
      },
      { $push: { entries: { author: req.auth.userId, post: post._id, postRevision: post.currentRevision || 1, note, likes: [], likesCount: 0 } } },
      { returnDocument: 'after' }
    );
    if (competition) return res.status(201).json({ data: { entered: true } });
    const existing = await Competition.findById(req.params.id).select('status openDate closeDate entries.author');
    if (!existing) return res.status(404).json({ message: 'Competition not found' });
    if (existing.entries.some(entry => entry.author.toString() === req.auth.userId)) return res.status(409).json({ message: 'You already entered this competition' });
    return res.status(400).json({ message: 'Competition is not accepting entries' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit entry' });
  }
};

const voteEntry = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.entryId)) return res.status(400).json({ message: 'Invalid competition or entry id' });
    const now = new Date();
    const signals = getVoteSignals(req);
    const alreadyVoted = await Competition.exists({ _id: req.params.id, entries: { $elemMatch: { _id: req.params.entryId, likes: req.auth.userId } } });
    if (!alreadyVoted) {
      const risk = await getVoteRisk({ competitionId: req.params.id, ipHash: signals.ipHash, userAgentHash: signals.userAgentHash, now });
      if (risk.blocked) {
        await CompetitionAudit.create({ competitionId: req.params.id, actorId: req.auth.userId, action: 'vote_blocked', details: { entryId: req.params.entryId, reason: risk.reason, count: risk.count, deviceCount: risk.deviceCount, windowMs: risk.windowMs } });
        return res.status(429).json({ error: { code: 'COMPETITION_VOTE_REVIEW', message: 'Voting activity from this network needs review before more votes can be recorded.' } });
      }
    }
    const updated = await Competition.findOneAndUpdate(
      {
        _id: req.params.id, status: { $in: ['open', 'judging'] }, votingMode: { $in: ['readers', 'hybrid'] },
        $or: [{ resultsDate: null }, { resultsDate: { $gt: now } }],
      entries: { $elemMatch: { _id: req.params.entryId, status: 'submitted', author: { $ne: req.auth.userId }, likes: { $ne: req.auth.userId } } },
      },
      { $addToSet: { 'entries.$[entry].likes': req.auth.userId }, $inc: { 'entries.$[entry].likesCount': 1 } },
      { returnDocument: 'after', arrayFilters: [{ 'entry._id': req.params.entryId }] }
    );
    if (!updated) {
      const existing = await Competition.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Competition not found' });
      const entry = existing.entries.id(req.params.entryId);
      if (!entry) return res.status(404).json({ message: 'Entry not found' });
      const votePolicy = canVoteEntry(existing, entry, req.auth.userId, now);
      if (votePolicy.reason === 'SELF_VOTE') return res.status(403).json({ message: 'You cannot vote for your own entry' });
      if (votePolicy.reason === 'ENTRY_DISQUALIFIED') return res.status(409).json({ message: 'This entry is not eligible for voting' });
      if (votePolicy.reason === 'VOTING_CLOSED') return res.status(409).json({ message: 'Voting is closed' });
      if (votePolicy.reason === 'ALREADY_VOTED') return res.status(200).json({ data: { isVoted: true, likesCount: entry.likesCount || entry.likes.length } });
      return res.status(409).json({ message: 'Vote could not be recorded' });
    }
    const entry = updated.entries.id(req.params.entryId);
    await recordVoteSignal({ competitionId: updated._id, entryId: entry._id, voterId: req.auth.userId, ...signals });
    return res.status(200).json({ data: { isVoted: true, likesCount: entry.likesCount } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to vote for entry' });
  }
};

const removeEntryVote = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.entryId)) return res.status(400).json({ message: 'Invalid competition or entry id' });
    const now = new Date();
    const existing = await Competition.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Competition not found' });
    const existingEntry = existing.entries.id(req.params.entryId);
    if (!existingEntry) return res.status(404).json({ message: 'Entry not found' });
    if (existingEntry.status === 'disqualified') return res.status(409).json({ message: 'This entry is not eligible for voting' });
    if (!isVotingOpen(existing, now)) return res.status(409).json({ message: 'Voting is closed' });
    const updated = await Competition.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['open', 'judging'] }, votingMode: { $in: ['readers', 'hybrid'] }, $or: [{ resultsDate: null }, { resultsDate: { $gt: now } }], entries: { $elemMatch: { _id: req.params.entryId, likes: req.auth.userId, likesCount: { $gt: 0 } } } },
      { $pull: { 'entries.$[entry].likes': req.auth.userId }, $inc: { 'entries.$[entry].likesCount': -1 } },
      { returnDocument: 'after', arrayFilters: [{ 'entry._id': req.params.entryId }] }
    );
    if (!updated) {
      return res.status(200).json({ data: { isVoted: false, likesCount: existingEntry.likesCount || existingEntry.likes.length } });
    }
    const entry = updated.entries.id(req.params.entryId);
    await removeVoteSignal({ competitionId: updated._id, entryId: entry._id, voterId: req.auth.userId });
    return res.status(200).json({ data: { isVoted: false, likesCount: entry.likesCount } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to remove entry vote' });
  }
};

const createCompetition = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const coverImage = String(req.body.coverImage || '').trim();
    const openDate = new Date(req.body.openDate);
    const closeDate = new Date(req.body.closeDate);
    const resultsDate = req.body.resultsDate ? new Date(req.body.resultsDate) : null;
    const votingMode = req.body.votingMode || 'readers';
    const competitionType = req.body.competitionType || 'theme';
    const rules = Array.isArray(req.body.rules) ? req.body.rules.map(rule => String(rule).trim()).filter(Boolean).slice(0, 20) : [];
    let coverImageUrl = '';
    if (coverImage) {
      try {
        const parsedCoverImage = new URL(coverImage);
        if (!['http:', 'https:'].includes(parsedCoverImage.protocol) || parsedCoverImage.username || parsedCoverImage.password) throw new Error('invalid cover image');
        coverImageUrl = parsedCoverImage.toString();
      } catch {
        return res.status(400).json({ message: 'Cover image must be a valid HTTP(S) URL' });
      }
    }
    if (!title || title.length > 180 || description.length > 5000 || coverImageUrl.length > 2000 || Number.isNaN(openDate.getTime()) || Number.isNaN(closeDate.getTime()) || closeDate <= openDate) return res.status(400).json({ message: 'Invalid competition details' });
    if (!['readers', 'judges', 'hybrid'].includes(votingMode) || !['theme', 'timed', 'collaborative', 'reader_choice'].includes(competitionType)) return res.status(400).json({ message: 'Invalid competition mode' });
    if (resultsDate && (Number.isNaN(resultsDate.getTime()) || resultsDate <= closeDate)) return res.status(400).json({ message: 'Results date must follow the closing date' });
    const competition = await Competition.create({ title, description, coverImage: coverImageUrl, openDate, closeDate, resultsDate, votingMode, competitionType, rules, status: 'open', createdBy: req.auth.userId });
    await CompetitionAudit.create({ competitionId: competition._id, actorId: req.auth.userId, action: 'created', details: { votingMode, competitionType } });
    return res.status(201).json({ data: presentCompetition(competition, req.auth.userId) });
  } catch { return res.status(500).json({ message: 'Unable to create competition' }); }
};

const scoreEntry = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.entryId)) return res.status(400).json({ message: 'Invalid competition or entry id' });
    const scores = ['craft', 'originality', 'relevance'].reduce((result, key) => ({ ...result, [key]: Number(req.body[key]) }), {});
    const note = String(req.body.note || '').trim();
    if (Object.values(scores).some(value => !Number.isInteger(value) || value < 1 || value > 10) || note.length > 1000) return res.status(400).json({ message: 'Scores must be whole numbers from 1 to 10' });
    const competition = await Competition.findOne({ _id: req.params.id, votingMode: { $in: ['judges', 'hybrid'] }, 'entries._id': req.params.entryId });
    if (!competition) return res.status(404).json({ message: 'Scorable entry not found' });
    const entry = competition.entries.id(req.params.entryId);
    const scorePolicy = canScoreEntry(competition, entry);
    if (!scorePolicy.allowed) return res.status(409).json({ message: scorePolicy.reason === 'ENTRY_DISQUALIFIED' ? 'Disqualified entries cannot be scored' : scorePolicy.reason === 'COMPETITION_CLOSED' ? 'Closed competitions cannot be scored' : 'Judge scoring opens after voting closes' });
    const existing = entry.judgeScores.find(score => score.judgeId.toString() === req.auth.userId);
    if (existing) Object.assign(existing, scores, { note });
    else entry.judgeScores.push({ judgeId: req.auth.userId, ...scores, note });
    await competition.save();
    await CompetitionAudit.create({ competitionId: competition._id, actorId: req.auth.userId, action: 'scored', details: { entryId: entry._id } });
    return res.json({ data: { entryId: entry._id, score: (scores.craft + scores.originality + scores.relevance) / 3 } });
  } catch { return res.status(500).json({ message: 'Unable to score entry' }); }
};

const publishResults = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !Array.isArray(req.body.winnerEntryIds) || req.body.winnerEntryIds.length < 1 || req.body.winnerEntryIds.length > 5 || req.body.winnerEntryIds.some(id => !isValidId(id))) return res.status(400).json({ message: 'Select between one and five valid winners' });
    let competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: 'Competition not found' });
    if (!canPublishResults(competition)) return res.status(409).json({ message: 'Results can only be published after voting closes' });
    const winnerIds = [...new Set(req.body.winnerEntryIds.map(String))];
    if (winnerIds.length !== req.body.winnerEntryIds.length || winnerIds.some(id => !competition.entries.id(id) || competition.entries.id(id).status === 'disqualified')) return res.status(400).json({ message: 'One or more winners are not eligible entries' });
    const now = new Date();
    const published = await Competition.findOneAndUpdate(
      {
        _id: req.params.id,
        $and: [
          { $or: [{ status: 'judging' }, { status: 'open', closeDate: { $lte: now } }] },
          { $or: [{ resultsDate: null }, { resultsDate: { $gt: now } }] },
        ],
      },
      { $set: { winnerEntryIds: winnerIds, status: 'closed', resultsDate: competition.resultsDate || now } },
      { returnDocument: 'after' },
    );
    if (!published) return res.status(409).json({ message: 'Competition results were already published or the judging window has closed' });
    competition = published;
    await CompetitionAudit.create({ competitionId: competition._id, actorId: req.auth.userId, action: 'results_published', details: { winnerEntryIds: winnerIds, ranking: rankCompetitionEntries(competition.entries, competition.votingMode).map(({ id, rank, score }) => ({ id, rank, score })) } });
    await Promise.all(winnerIds.map(id => { const entry = competition.entries.id(id); return notify({ recipientId: entry.author, actorId: req.auth.userId, type: 'competition_result', title: `You placed in ${competition.title}`, body: 'The competition results are now public.', href: `/explore/competitions/${competition._id}`, entityType: 'competition', entityId: competition._id }); }));
    return res.json({ data: presentCompetition(competition, req.auth.userId, true) });
  } catch { return res.status(500).json({ message: 'Unable to publish competition results' }); }
};

const disqualifyEntry = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.entryId)) return res.status(400).json({ message: 'Invalid competition or entry id' });
    const reason = String(req.body?.reason || '').trim();
    if (!reason || reason.length > 2000) return res.status(400).json({ message: 'A disqualification reason is required' });
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: 'Competition not found' });
    const status = effectiveStatus(competition);
    if (!['open', 'judging'].includes(status)) return res.status(409).json({ message: 'Competition entries cannot be changed in this phase' });
    const entry = competition.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.status === 'disqualified') return res.status(409).json({ message: 'Entry is already disqualified' });
    entry.status = 'disqualified';
    entry.disqualificationReason = reason;
    entry.disqualifiedAt = new Date();
    entry.disqualifiedBy = req.auth.userId;
    competition.winnerEntryIds = competition.winnerEntryIds.filter(id => id.toString() !== req.params.entryId);
    await competition.save();
    await CompetitionAudit.create({ competitionId: competition._id, actorId: req.auth.userId, action: 'entry_disqualified', details: { entryId: entry._id, reason } });
    return res.json({ data: { entryId: entry._id, status: entry.status } });
  } catch { return res.status(500).json({ message: 'Unable to disqualify entry' }); }
};

const submitAppeal = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.entryId)) return res.status(400).json({ message: 'Invalid competition or entry id' });
    const reason = String(req.body?.reason || '').trim();
    if (!reason || reason.length > 2000) return res.status(400).json({ message: 'An appeal reason is required' });
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: 'Competition not found' });
    const entry = competition.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    if (entry.author.toString() !== req.auth.userId) return res.status(403).json({ message: 'Only the entry author can appeal' });
    if (entry.status !== 'disqualified') return res.status(409).json({ message: 'Only disqualified entries can be appealed' });
    const appeal = await CompetitionAppeal.create({ competitionId: competition._id, entryId: entry._id, appellantId: req.auth.userId, reason });
    await CompetitionAudit.create({ competitionId: competition._id, actorId: req.auth.userId, action: 'appeal_submitted', details: { entryId: entry._id, appealId: appeal._id } });
    return res.status(201).json({ data: { id: appeal._id, status: appeal.status } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'An appeal has already been submitted for this entry' });
    return res.status(500).json({ message: 'Unable to submit appeal' });
  }
};

const decideAppeal = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.params.appealId)) return res.status(400).json({ message: 'Invalid competition or appeal id' });
    const decision = String(req.body?.decision || '');
    const decisionNote = String(req.body?.note || '').trim();
    if (!['accepted', 'rejected'].includes(decision) || !decisionNote || decisionNote.length > 2000) return res.status(400).json({ message: 'A valid appeal decision and note are required' });
    const appeal = await CompetitionAppeal.findOne({ _id: req.params.appealId, competitionId: req.params.id });
    if (!appeal) return res.status(404).json({ message: 'Appeal not found' });
    if (appeal.status !== 'pending') return res.status(409).json({ message: 'Appeal has already been decided' });
    const competition = await Competition.findById(req.params.id);
    const entry = competition?.entries.id(appeal.entryId);
    if (!competition || !entry) return res.status(404).json({ message: 'Appeal entry not found' });
    if (decision === 'accepted' && effectiveStatus(competition) === 'closed') return res.status(409).json({ message: 'Published competition results cannot be changed by an appeal' });
    appeal.status = decision;
    appeal.decisionNote = decisionNote;
    appeal.decidedBy = req.auth.userId;
    appeal.decidedAt = new Date();
    await appeal.save();
    if (decision === 'accepted') {
      entry.status = 'submitted';
      entry.disqualificationReason = '';
      entry.disqualifiedAt = null;
      entry.disqualifiedBy = null;
      await competition.save();
    }
    await CompetitionAudit.create({ competitionId: competition._id, actorId: req.auth.userId, action: 'appeal_decided', details: { entryId: entry._id, appealId: appeal._id, decision, note: decisionNote } });
    return res.json({ data: { id: appeal._id, status: appeal.status, entryStatus: entry.status } });
  } catch { return res.status(500).json({ message: 'Unable to decide appeal' }); }
};

module.exports = { effectiveStatus, isVotingOpen, canVoteEntry, competitionStatusCandidates, canScoreEntry, canPublishResults, getCompetitions, getCompetitionById, getEligiblePosts, enterCompetition, voteEntry, removeEntryVote, createCompetition, scoreEntry, publishResults, disqualifyEntry, submitAppeal, decideAppeal };
