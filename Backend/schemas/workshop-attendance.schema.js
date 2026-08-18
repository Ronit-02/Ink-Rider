const mongoose = require('mongoose');

const workshopAttendanceSchema = new mongoose.Schema({
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['registered', 'attended', 'canceled'], default: 'registered' },
}, { timestamps: true, versionKey: false });

workshopAttendanceSchema.index({ workshopId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('WorkshopAttendance', workshopAttendanceSchema);
