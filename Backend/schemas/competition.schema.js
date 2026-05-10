const mongoose = require('mongoose');

/* Competition — writing contest with entries */
const entrySchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  note:    { type: String, default: '' },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  coverImage:  { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'open', 'judging', 'closed'],
    default: 'open',
  },
  openDate:     { type: Date, default: Date.now },
  closeDate:    { type: Date, required: true },
  resultsDate:  { type: Date },
  prizes: [{
    rank:   { type: String },
    amount: { type: String },
  }],
  entries:   [entrySchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false });

competitionSchema.index({ status: 1, closeDate: 1 });

module.exports = mongoose.model('Competition', competitionSchema);
