const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  requests: { type: Number, default: 0, min: 0 },
}, { timestamps: true, versionKey: false });

aiUsageSchema.index({ userId: 1, day: 1 }, { unique: true });
module.exports = mongoose.model('AiUsage', aiUsageSchema);
