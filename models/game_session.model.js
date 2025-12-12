const mongoose = require("mongoose");
const crypto = require("crypto");

const gameSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    id: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(3).toString("hex").toUpperCase(),
    },
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "player"
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"}],
    gameMasterID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      enum: ["pending", "active", "ended"],
      default: "pending",
    },
    winnerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    }
        // messages: [
    //   {
    //     senderID: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "User",
    //       required: true,
    //     },
    //     content: {
    //       type: String,
    //       maxlength: 1000,
    //       required: true,
    //     },
    //     timestamp: {
    //       type: Date,
    //       default: Date.now,
    //     },
    //   },
    // ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("game_session", gameSessionSchema);
