const mongoose = require('mongoose');

const postRevisionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  revision: { type: Number, required: true, min: 1 },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  coverImage: { type: String, default: null },
  format: { type: String, enum: ['article', 'short'], required: true },
  tags: [{ type: String }],
  publicAt: { type: Date, required: true },
}, { timestamps: true, versionKey: false });

postRevisionSchema.index({ postId: 1, revision: 1 }, { unique: true });

module.exports = mongoose.model('PostRevision', postRevisionSchema);
