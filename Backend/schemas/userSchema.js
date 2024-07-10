const mongoose = require('mongoose')

// Primary key -> email
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
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
    }
}, {
    timeStamps: true
});

userSchema.index({username: 'text'});

module.exports = mongoose.model('User', userSchema);