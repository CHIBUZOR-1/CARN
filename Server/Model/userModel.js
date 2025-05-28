const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    resetPasswordToken: { type: String},
    resetPasswordExpiresAt: { type: Date},
    verificationTokenExpiresAt: {
        type: Date
    },
}, {
    timestamps: true,
    minimize: false
})

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;