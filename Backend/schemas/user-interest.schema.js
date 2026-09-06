const mongoose = require('mongoose');

const userInterestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  explicitWeight: { type: Number, min: 0, max: 1, default: 0 },
  inferredWeight: { type: Number, min: 0, max: 1, default: 0 },
}, { timestamps: true, versionKey: false });

userInterestSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('UserInterest', userInterestSchema);
