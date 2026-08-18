const mongoose = require('mongoose');

const postSummarySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, unique: true },
  sourceHash: { type: String, required: true },
  points: [{ type: String, required: true, maxlength: 500 }],
  provider: { type: String, required: true },
  disclosure: { type: String, required: true },
  generatedAt: { type: Date, required: true },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('PostSummary', postSummarySchema);
