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
        trim: true
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
        }
    ],
    likes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            comment: {
                type: String,
                required: true
            },
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            date: {
                type: Date,
                default: Date.now,
            },
        }
    ],
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

module.exports = mongoose.model('Post', postSchema);