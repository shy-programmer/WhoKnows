const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    players: [mongoose.Schema.Types.ObjectId],
    gameMasterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    duration: {
        type: Number, // duration in seconds
        required: true,
        min: 0,
        default: 60, // default to 1 minute
    },
    question: {
        type: String,
        maxlength: 500,
    },
    answer: {
        type: String,
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'ended'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('gameSession', gameSessionSchema);