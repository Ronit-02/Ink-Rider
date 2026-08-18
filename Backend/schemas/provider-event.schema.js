const mongoose = require('mongoose');

const providerEventSchema = new mongoose.Schema({
  provider: { type: String, enum: ['stripe'], required: true },
  eventId: { type: String, required: true, trim: true },
  eventType: { type: String, required: true, trim: true },
  payloadHash: { type: String, required: true },
  status: { type: String, enum: ['received', 'processed', 'failed'], default: 'received' },
  processedAt: { type: Date, default: null },
  failureCode: { type: String, default: null },
}, { timestamps: true, versionKey: false });

providerEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('ProviderEvent', providerEventSchema);
