const mongoose = require('mongoose');

const moderationActionSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
  moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['begin_review', 'dismiss', 'recommend_remove', 'recommend_suspend'], required: true },
  note: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true, versionKey: false });

moderationActionSchema.index({ reportId: 1, createdAt: 1 });
module.exports = mongoose.model('ModerationAction', moderationActionSchema);
