const mongoose = require('mongoose');

const creatorRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 140 },
  details: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'answered'], default: 'pending', index: true },
  response: { type: String, default: null, trim: true, maxlength: 2000 },
  periodKey: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
}, { timestamps: true, versionKey: false });

creatorRequestSchema.index({ requesterId: 1, periodKey: 1 });
creatorRequestSchema.index({ creatorId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CreatorRequest', creatorRequestSchema);
