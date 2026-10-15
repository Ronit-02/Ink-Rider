const mongoose = require('mongoose');

const shortSeriesSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', trim: true, maxlength: 500 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Older series have no type and are short series.
  type: { type: String, enum: ['article', 'short'], default: 'short', index: true },
  visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public', index: true },
  items: [{
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    position: { type: Number, required: true, min: 0 },
  }],
}, { timestamps: true, versionKey: false });

shortSeriesSchema.index({ visibility: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('ShortSeries', shortSeriesSchema);
