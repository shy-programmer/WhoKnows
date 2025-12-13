const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'game_session',
        required: true
    },
    inGame: {
        type: Boolean,
        default: true
    },
    score: {
        type: Number,
        default: 0
    },
    attemptsLeft: {
        type: Number,
        default: 3
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000), 
      index: { expires: 0 } // TTL
    },
}, { timestamps: true }
);

module.exports = mongoose.model('player', playerSchema);