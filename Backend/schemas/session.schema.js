const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    lastUsedAt: {
        type: Date,
        default: Date.now,
    },
    revokedAt: Date,
}, {
    timestamps: true
})

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
