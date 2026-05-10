// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    planType: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true,
    },

    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active',
        index: true,
    },

    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },

    endDate: {
        type: Date,
        required: true,
    },

    paymentId: {
        type: String,
        default: null,
    },

}, {
  timestamps: true,
});

// Prevent duplicate active subscriptions
subscriptionSchema.index({ subscriberId: 1, authorId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);