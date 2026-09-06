const mongoose = require('mongoose');

const creatorUpdateSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  body: { type: String, required: true, trim: true, maxlength: 10000 },
  audience: { type: String, enum: ['members', 'supporters'], default: 'members', index: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  publishedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

creatorUpdateSchema.index({ status: 1, publishedAt: -1, _id: -1 });

module.exports = mongoose.model('CreatorUpdate', creatorUpdateSchema);
