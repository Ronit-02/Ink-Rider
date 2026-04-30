const mongoose = require('mongoose');

// Primary key -> email
const userSchema = new mongoose.Schema({
    picture: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: true,
        minlength: 1,
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
        minlength: 1
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
        required: false,
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

module.exports = mongoose.model('User', userSchema);