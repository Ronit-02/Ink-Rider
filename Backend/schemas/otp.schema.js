const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        // index: { expires: 0 }, // This will automatically delete the document after 'expiresAt' time
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('OTP', otpSchema);