const mongoose = require('mongoose')

// Primary key -> email
const userSchema = new mongoose.Schema({
    picture: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
        minlength: 3
        // required: function(){
        //     return !this.googleId
        // }
    },
    verified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        default: 'regular',
        enum: ['regular', 'premium', 'exclusive-writer']
    },
    followers: {
        type: Number,
        required: true,
        default: 0
    },
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
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
    liked: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }
    ],
    saved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        }
    ]
}, {
    timestamps: true
});

// Text Indexes for searching
userSchema.index({username: 'text'});
// Number Indexes for performance optimizations
userSchema.index({email: 1});

module.exports = mongoose.model('User', userSchema);