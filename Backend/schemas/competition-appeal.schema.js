const mongoose = require('mongoose');

const competitionAppealSchema = new mongoose.Schema({
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
  entryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  appellantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  decisionNote: { type: String, default: '', trim: true, maxlength: 2000 },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  decidedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

competitionAppealSchema.index({ competitionId: 1, entryId: 1, appellantId: 1 }, { unique: true });
competitionAppealSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('CompetitionAppeal', competitionAppealSchema);
