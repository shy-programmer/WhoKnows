const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    attemptsLeft: {
        type: Number,
        default: 3
    }
}, { timestamps: true }
);

module.exports = mongoose.model('player', playerSchema);