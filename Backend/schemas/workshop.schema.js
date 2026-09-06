const mongoose = require('mongoose');
const { isSafeHttpUrl } = require('../utils/safe-url');

const workshopSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  capacity: { type: Number, min: 1, max: 10000, default: 100 },
  meetingUrl: { type: String, required: true, trim: true, validate: { validator: isSafeHttpUrl, message: 'Invalid meeting URL' } },
  status: { type: String, enum: ['draft', 'published', 'canceled', 'completed'], default: 'draft', index: true },
}, { timestamps: true, versionKey: false });

workshopSchema.index({ status: 1, startsAt: 1 });

module.exports = mongoose.model('Workshop', workshopSchema);
