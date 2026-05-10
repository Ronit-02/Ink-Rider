const mongoose = require('mongoose');

/* Collection — user-curated set of posts */
const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  coverImage: {
    type: String,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true, versionKey: false });

collectionSchema.index({ author: 1 });
collectionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Collection', collectionSchema);