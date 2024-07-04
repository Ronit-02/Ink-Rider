const mongoose = require('mongoose');

// Primary key -> id
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,    
        ref: 'User',
        required: true,
    },
    tags: [
        {
            tag: String,
        }
    ],
    likes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            comment: String,
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

module.exports = mongoose.model('Post', postSchema);