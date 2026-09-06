const mongoose = require('mongoose');

const creatorSupportSchema = new mongoose.Schema({
  supporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['active', 'past_due', 'canceled'], default: 'active' },
  allocationPercent: { type: Number, min: 1, max: 100, default: 100 },
  providerSubscriptionId: { type: String, default: null },
}, { timestamps: true, versionKey: false });

creatorSupportSchema.index({ supporterId: 1, creatorId: 1 }, { unique: true });

module.exports = mongoose.model('CreatorSupport', creatorSupportSchema);
