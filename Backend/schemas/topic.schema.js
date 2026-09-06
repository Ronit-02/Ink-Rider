const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, required: true, trim: true, maxlength: 60 },
  description: { type: String, default: '', trim: true, maxlength: 240 },
  aliases: [{ type: String, lowercase: true, trim: true }],
  status: { type: String, enum: ['active', 'retired'], default: 'active', index: true },
  order: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

topicSchema.index({ status: 1, order: 1, slug: 1 });

module.exports = mongoose.model('Topic', topicSchema);
