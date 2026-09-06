const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['free', 'member'], default: 'free' },
  status: { type: String, enum: ['inactive', 'trialing', 'active', 'past_due', 'canceled'], default: 'inactive', index: true },
  provider: { type: String, enum: ['stripe'], default: null },
  providerCustomerId: { type: String, default: null, trim: true },
  providerSubscriptionId: { type: String, default: null, trim: true },
  currentPeriodStart: { type: Date, default: null },
  currentPeriodEnd: { type: Date, default: null },
  cancelAtPeriodEnd: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

membershipSchema.index(
  { provider: 1, providerSubscriptionId: 1 },
  { unique: true, partialFilterExpression: { providerSubscriptionId: { $type: 'string' } } }
);

module.exports = mongoose.model('Membership', membershipSchema);
