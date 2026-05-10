const mongoose = require('mongoose');

// Primary key -> id
const postSchema = new mongoose.Schema({
    coverImage: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    body: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,    
        ref: 'User',
        required: true,
    },
    tags: [
        {
            type: String,
            lowercase: true,
            trim: true
        }
    ],

    // Derived Values (cache)
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },

    // Nested Values
    metadata: {
        views: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
            default: 0
        },
    }
},{
    timestamps: true,
    versionKey: false
});

// Text indexes to enable searching
postSchema.index({title: 'text', body: 'text', tags: 'text'});

// Number indexes for performance optimizations
postSchema.index({author: 1});
postSchema.index({'comments.author': 1});

module.exports = mongoose.model('Post', postSchema);