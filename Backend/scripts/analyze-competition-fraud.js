const mongoose = require('mongoose');
const CompetitionVote = require('../schemas/competition-vote.schema');
const { connectToMongoDB } = require('../utils/mongoConnect');
const { analyzeVoteSignals, VOTE_SIGNAL_WINDOW_MS } = require('../services/competition-fraud.service');

const requestedMinutes = Number(process.argv[2]);
const windowMs = Number.isFinite(requestedMinutes) && requestedMinutes > 0
  ? requestedMinutes * 60 * 1000
  : VOTE_SIGNAL_WINDOW_MS;

const run = async () => {
  await connectToMongoDB();
  const now = new Date();
  const votes = await CompetitionVote.find({ createdAt: { $gte: new Date(now.getTime() - windowMs) } })
    .select('competitionId voterId ipHash userAgentHash createdAt')
    .lean();

  console.log(JSON.stringify({
    analyzedVoteCount: votes.length,
    windowMs,
    signals: analyzeVoteSignals({ votes, now, windowMs }),
  }, null, 2));
};

run()
  .catch(error => {
    console.error('Competition fraud analysis failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
