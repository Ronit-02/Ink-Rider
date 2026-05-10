const mongoose = require('mongoose');

// Primary key -> email
const userSchema = new mongoose.Schema({
    picture: {
        type: String,
        default: null,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        minlength: 3,
        required: function(){
            return !this.googleId
        },
    },
    googleId: {
        type: String,
        default: null,
    },
    verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['regular', 'premium', 'exclusive-writer'],
        default: 'regular',
    },
    followers: {
        type: Number,
        required: false,
        default: 0
    },
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    // Derived Values (cache)
    followersCount: {
        type: Number,
        default: 0,
    },
    followingCount: {
        type: Number,
        default: 0,
    },

    // Nested Values
    subscription: {
        subscribed: {
            type: Boolean,
            default: false,
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
    },
}, {
    timestamps: true
});

// Text Indexes for searching
userSchema.index({ username: 'text' });  // text indexing
userSchema.index({ email: 1 }, { unique: true });  // ascending order indexing
userSchema.index({ googleId: 1 }, { unique: true });  // ascending order indexing

module.exports = mongoose.model('User', userSchema);