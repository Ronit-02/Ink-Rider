const mongoose = require('mongoose');

const notificationDeliverySchema = new mongoose.Schema({
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: String, enum: ['email', 'push'], required: true },
  status: { type: String, enum: ['pending', 'processing', 'failed', 'sent', 'dead'], default: 'pending' },
  attempts: { type: Number, min: 0, default: 0 },
  nextAttemptAt: { type: Date, default: Date.now, index: true },
  lockedAt: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  lastErrorCode: { type: String, default: null },
  providerMessageId: { type: String, default: null },
  payload: {
    to: { type: String, trim: true, maxlength: 320 },
    subject: { type: String, trim: true, maxlength: 180 },
    text: { type: String, trim: true, maxlength: 5000 },
    html: { type: String, trim: true, maxlength: 20000 },
  },
  idempotencyKey: { type: String, required: true, trim: true, maxlength: 180 },
}, { timestamps: true, versionKey: false });

notificationDeliverySchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });
notificationDeliverySchema.index({ idempotencyKey: 1 }, { unique: true });

module.exports = mongoose.model('NotificationDelivery', notificationDeliverySchema);
