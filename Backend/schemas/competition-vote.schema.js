const mongoose = require('mongoose');

/* Durable, privacy-preserving signals used to detect unusually dense voting. */
const competitionVoteSchema = new mongoose.Schema({
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
  entryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ipHash: { type: String, required: true },
  userAgentHash: { type: String, required: true },
}, { timestamps: true, versionKey: false });

competitionVoteSchema.index({ competitionId: 1, voterId: 1, entryId: 1 }, { unique: true });
competitionVoteSchema.index({ competitionId: 1, ipHash: 1, createdAt: -1 });

module.exports = mongoose.model('CompetitionVote', competitionVoteSchema);
