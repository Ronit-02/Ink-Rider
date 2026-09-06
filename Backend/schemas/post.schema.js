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
    format: {
        type: String,
        enum: ['article', 'short'],
        default: 'article',
        index: true,
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
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        index: true,
    }],
    sourceQuestion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        default: null,
        index: true,
    },
    depthParent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null,
        index: true,
    },
    publicationStatus: {
        type: String,
        enum: ['published', 'unpublished'],
        default: 'published',
        index: true,
    },
    currentRevision: {
        type: Number,
        default: 1,
        min: 1,
    },
    publicAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
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
postSchema.index({createdAt: -1, _id: -1});
postSchema.index({publicAt: 1, createdAt: -1, _id: -1});
postSchema.index({format: 1, createdAt: -1, _id: -1});
postSchema.index({likesCount: -1, _id: -1});
postSchema.index({createdAt: -1, likesCount: -1, _id: -1});

module.exports = mongoose.model('Post', postSchema);
