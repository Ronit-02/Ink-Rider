const mongoose = require('mongoose');

/* Question — writing community Q&A */
const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  context: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{ type: String, lowercase: true, trim: true }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  answers: [{
    text:      { type: String, required: true },
    author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
}, { timestamps: true, versionKey: false });

questionSchema.index({ text: 'text', tags: 'text' });
questionSchema.index({ author: 1 });

module.exports = mongoose.model('Question', questionSchema);
