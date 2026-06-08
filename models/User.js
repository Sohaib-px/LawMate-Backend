const mongoose = require('mongoose');

// MongoDB/Mongoose ka Schema define kar rhey hain
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'lawyer', 'admin'], // jo bhi aap k roles hain
        default: 'client'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Model export kar rhey hain jo index.js mein require ho rha hai
module.exports = mongoose.model('User', UserSchema);