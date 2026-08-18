const mongoose = require('mongoose');
const Report = require('../schemas/report.schema');
const ModerationAction = require('../schemas/moderation-action.schema');
const CompetitionVote = require('../schemas/competition-vote.schema');
const CompetitionAudit = require('../schemas/competition-audit.schema');
const { analyzeVoteSignals, VOTE_SIGNAL_WINDOW_MS } = require('../services/competition-fraud.service');

const parseCompetitionFraudMinutes = value => {
  const minutes = value == null ? 10 : Number(value);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 60 ? minutes : null;
};

const loadCompetitionFraudSignals = async ({ competitionId, minutes }) => {
  const now = new Date();
  const windowMs = minutes * 60 * 1000;
  const filter = { createdAt: { $gte: new Date(now.getTime() - windowMs) } };
  if (competitionId) filter.competitionId = competitionId;
  const votes = await CompetitionVote.find(filter)
    .select('competitionId voterId ipHash userAgentHash createdAt')
    .limit(5000)
    .lean();
  return { signals: analyzeVoteSignals({ votes, now, windowMs }), analyzedVoteCount: votes.length, windowMs };
};

const listReports = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    if (!['pending', 'reviewing', 'actioned', 'dismissed'].includes(status)) return res.status(400).json({ message: 'Invalid report status' });
    const reports = await Report.find({ status }).sort({ createdAt: 1 }).limit(100).populate('reporterId', 'username');
    return res.json({ data: reports });
  } catch { return res.status(500).json({ message: 'Unable to load moderation queue' }); }
};

const recordReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.reportId)) return res.status(400).json({ message: 'Invalid report id' });
    const action = req.body.action;
    const note = String(req.body.note || '').trim();
    if (!['begin_review', 'dismiss', 'recommend_remove', 'recommend_suspend'].includes(action) || !note || note.length > 2000) return res.status(400).json({ message: 'A valid review action and note are required' });
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (['actioned', 'dismissed'].includes(report.status)) return res.status(409).json({ message: 'This report is already resolved' });
    await ModerationAction.create({ reportId: report._id, moderatorId: req.auth.userId, action, note });
    report.status = action === 'dismiss' ? 'dismissed' : 'reviewing';
    await report.save();
    return res.json({ data: { id: report._id, status: report.status, recommendation: action.startsWith('recommend_') ? action : null } });
  } catch { return res.status(500).json({ message: 'Unable to record moderation review' }); }
};

const listCompetitionFraudSignals = async (req, res) => {
  try {
    const requestedMinutes = parseCompetitionFraudMinutes(req.query.minutes);
    if (requestedMinutes == null) return res.status(400).json({ message: 'Minutes must be an integer between 1 and 60' });
    const competitionId = req.query.competitionId ? String(req.query.competitionId) : null;
    if (competitionId && !mongoose.isValidObjectId(competitionId)) return res.status(400).json({ message: 'Invalid competition id' });

    const { signals, analyzedVoteCount, windowMs } = await loadCompetitionFraudSignals({ competitionId, minutes: requestedMinutes });
    const competitionIds = [...new Set(signals.map(signal => signal.competitionId))];
    const reviews = competitionIds.length
      ? await CompetitionAudit.find({ competitionId: { $in: competitionIds }, action: 'fraud_reviewed' }).sort({ createdAt: -1 }).lean()
      : [];
    const latestReviews = new Map();
    for (const review of reviews) {
      const key = `${String(review.competitionId)}:${review.details?.signalType}`;
      if (!latestReviews.has(key)) latestReviews.set(key, review);
    }
    const reviewedSignals = signals.map(signal => {
      const review = latestReviews.get(`${signal.competitionId}:${signal.signalType}`);
      return review ? {
        ...signal,
        review: {
          disposition: review.details.disposition,
          note: review.details.note,
          reviewedAt: review.createdAt,
        },
      } : signal;
    });

    return res.json({
      data: reviewedSignals,
      meta: { analyzedVoteCount, windowMs, defaultWindowMs: VOTE_SIGNAL_WINDOW_MS },
    });
  } catch {
    return res.status(500).json({ message: 'Unable to load competition fraud signals' });
  }
};

const reviewCompetitionFraudSignal = async (req, res) => {
  try {
    const competitionId = String(req.body.competitionId || '');
    const signalType = String(req.body.signalType || '').toUpperCase();
    const disposition = String(req.body.disposition || '').toLowerCase();
    const note = String(req.body.note || '').trim();
    const minutes = Number(req.body.minutes);
    if (!mongoose.isValidObjectId(competitionId)) return res.status(400).json({ message: 'Invalid competition id' });
    if (!['NETWORK', 'DEVICE'].includes(signalType)) return res.status(400).json({ message: 'Invalid fraud signal type' });
    if (!['confirmed', 'false_positive', 'needs_investigation'].includes(disposition) || !note || note.length > 2000) return res.status(400).json({ message: 'A valid fraud disposition and note are required' });
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 60) return res.status(400).json({ message: 'Minutes must be an integer between 1 and 60' });

    const { signals, windowMs } = await loadCompetitionFraudSignals({ competitionId, minutes });
    const signal = signals.find(item => item.competitionId === competitionId && item.signalType === signalType);
    if (!signal) return res.status(404).json({ message: 'Fraud signal is no longer present in this window' });

    const audit = await CompetitionAudit.create({
      competitionId,
      actorId: req.auth.userId,
      action: 'fraud_reviewed',
      details: {
        signalType,
        disposition,
        note,
        windowMs,
        distinctVoterCount: signal.distinctVoterCount,
        voteCount: signal.voteCount,
      },
    });
    return res.status(201).json({ data: { id: audit._id, competitionId, signalType, disposition, reviewedAt: audit.createdAt } });
  } catch { return res.status(500).json({ message: 'Unable to record fraud review' }); }
};

module.exports = { listReports, recordReview, listCompetitionFraudSignals, reviewCompetitionFraudSignal, parseCompetitionFraudMinutes, loadCompetitionFraudSignals };
