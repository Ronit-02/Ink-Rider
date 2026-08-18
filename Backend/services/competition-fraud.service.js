const crypto = require('crypto');
const config = require('../config/config');
const CompetitionVote = require('../schemas/competition-vote.schema');

const VOTE_SIGNAL_WINDOW_MS = 10 * 60 * 1000;
const MAX_NETWORK_VOTES_PER_WINDOW = 10;
const MAX_DEVICE_VOTES_PER_WINDOW = 8;
const MIN_CROSS_ACCOUNT_VOTES = 4;

const fingerprint = value => crypto
  .createHash('sha256')
  .update(`${config.JWT_SECRET}:${value || 'unknown'}`)
  .digest('hex');

const getVoteSignals = req => ({
  ipHash: fingerprint(req.ip || req.socket?.remoteAddress),
  userAgentHash: fingerprint(req.get?.('user-agent') || 'unknown'),
});

const getVoteRisk = async ({ competitionId, ipHash, userAgentHash, now = new Date() }) => {
  const since = new Date(now.getTime() - VOTE_SIGNAL_WINDOW_MS);
  const [networkCount, deviceCount] = await Promise.all([
    CompetitionVote.countDocuments({ competitionId, ipHash, createdAt: { $gte: since } }),
    CompetitionVote.countDocuments({ competitionId, userAgentHash, createdAt: { $gte: since } }),
  ]);
  return {
    blocked: networkCount >= MAX_NETWORK_VOTES_PER_WINDOW || deviceCount >= MAX_DEVICE_VOTES_PER_WINDOW,
    reason: networkCount >= MAX_NETWORK_VOTES_PER_WINDOW ? 'NETWORK_BURST' : deviceCount >= MAX_DEVICE_VOTES_PER_WINDOW ? 'DEVICE_BURST' : null,
    count: networkCount,
    limit: MAX_NETWORK_VOTES_PER_WINDOW,
    deviceCount,
    deviceLimit: MAX_DEVICE_VOTES_PER_WINDOW,
    windowMs: VOTE_SIGNAL_WINDOW_MS,
  };
};

/*
 * Produce an operator-facing fraud signal without returning the identifying
 * fingerprints or voter IDs that produced it. This is intentionally advisory:
 * shared networks and devices are legitimate, so the live vote guard remains
 * responsible for blocking only dense bursts.
 */
const analyzeVoteSignals = ({ votes, now = new Date(), windowMs = VOTE_SIGNAL_WINDOW_MS }) => {
  const since = new Date(now.getTime() - windowMs);
  const groups = new Map();

  for (const vote of votes || []) {
    const createdAt = new Date(vote.createdAt);
    if (Number.isNaN(createdAt.getTime()) || createdAt < since || createdAt > now) continue;

    for (const [signalType, signalValue] of [['NETWORK', vote.ipHash], ['DEVICE', vote.userAgentHash]]) {
      if (!signalValue || !vote.competitionId || !vote.voterId) continue;
      const key = `${String(vote.competitionId)}:${signalType}:${String(signalValue)}`;
      const group = groups.get(key) || {
        competitionId: String(vote.competitionId),
        signalType,
        voterIds: new Set(),
        voteCount: 0,
      };
      group.voterIds.add(String(vote.voterId));
      group.voteCount += 1;
      groups.set(key, group);
    }
  }

  return [...groups.values()]
    .filter(group => group.voterIds.size >= MIN_CROSS_ACCOUNT_VOTES)
    .map(group => ({
      competitionId: group.competitionId,
      signalType: group.signalType,
      distinctVoterCount: group.voterIds.size,
      voteCount: group.voteCount,
      windowMs,
      reason: 'CROSS_ACCOUNT_SIGNAL',
    }))
    .sort((left, right) => right.distinctVoterCount - left.distinctVoterCount || left.signalType.localeCompare(right.signalType));
};

const recordVoteSignal = async ({ competitionId, entryId, voterId, ipHash, userAgentHash }) => {
  try {
    await CompetitionVote.updateOne(
      { competitionId, entryId, voterId },
      { $setOnInsert: { competitionId, entryId, voterId, ipHash, userAgentHash } },
      { upsert: true },
    );
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }
};

const removeVoteSignal = ({ competitionId, entryId, voterId }) => CompetitionVote.deleteOne({ competitionId, entryId, voterId });

module.exports = {
  VOTE_SIGNAL_WINDOW_MS,
  MAX_NETWORK_VOTES_PER_WINDOW,
  MAX_DEVICE_VOTES_PER_WINDOW,
  MIN_CROSS_ACCOUNT_VOTES,
  getVoteSignals,
  getVoteRisk,
  analyzeVoteSignals,
  recordVoteSignal,
  removeVoteSignal,
};
