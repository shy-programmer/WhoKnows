const joi = require('joi');
const gameSessionModel = require('../models/game_session.model');
const playerModel = require('../models/player.model');


// ----------------------------------------------------
// 1. Validate Create Game Session
// ----------------------------------------------------
const ValidateCreateSession = async (req, res, next) => {
    const schema = joi.object({
        type: joi.string().valid('public', 'private').required(),
        duration: joi.number().integer().min(10).max(300).required(), // 10–300 sec
        maxPlayers: joi.number().integer().min(2).max(20).required()
    });

    try {
        await schema.validateAsync(req.body);

        // Additional check: no duplicate session code
        const existing = await gameSessionModel.findOne({ id: req.body.id });
        if (existing) {
            return res.status(400).json({ message: "Game session code already exists" });
        }

        next();
    }
    catch (error) {
        res.status(400).json({
            message: error.details ? error.details[0].message : "Validation error"
        });
    }
};


// ----------------------------------------------------
// 2. Validate Question Submission
// ----------------------------------------------------
const ValidateQuestion = async (req, res, next) => {
    const schema = joi.object({
        question: joi.string().min(3).max(200).required(),
        answer: joi.string().min(1).max(100).required()
    });

    try {
        await schema.validateAsync(req.body);

        const session = await gameSessionModel.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ message: "Game session not found" });
        }

        if (session.status !== "pending") {
            return res.status(400).json({ message: "Cannot add question to an active or ended session" });
        }

        next();
    }
    catch (error) {
        res.status(400).json({
            message: error.details ? error.details[0].message : "Validation error"
        });
    }
};


// ----------------------------------------------------
// 3. Validate Start Game Session
// ----------------------------------------------------
const ValidateStartSession = async (req, res, next) => {
    try {
        const session = await gameSessionModel.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ message: "Game session not found" });
        }

        if (!session.question || !session.answer) {
            return res.status(400).json({ message: "You must set a question and answer before starting the session" });
        }

        if (session.status !== "pending") {
            return res.status(400).json({ message: "Session is already active or ended" });
        }

        next();
    }
    catch (error) {
        res.status(400).json({ message: "Validation error" });
    }
};


// ----------------------------------------------------
// 4. Validate Attempt Answer
// ----------------------------------------------------
const ValidateAttempt = async (req, res, next) => {
    const schema = joi.object({
        answer: joi.string().min(1).max(100).required()
    });

    try {
        await schema.validateAsync(req.body);

        const session = await gameSessionModel.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ message: "Game session not found" });
        }

        if (session.status !== "active") {
            return res.status(400).json({ message: "Game session is not active" });
        }

        const player = await playerModel.findOne({
            userId: req.user?.id,
            sessionId: req.params.sessionId
        });

        if (!player) {
            return res.status(403).json({ message: "User not part of this game session" });
        }

        if (player.attemptsLeft <= 0) {
            return res.status(400).json({ message: "No attempts left" });
        }

        next();
    }
    catch (error) {
        res.status(400).json({
            message: error.details ? error.details[0].message : "Validation error"
        });
    }
};


// ----------------------------------------------------
// 5. Validate End Game Session
// ----------------------------------------------------
const ValidateEndSession = async (req, res, next) => {
    try {
        const session = await gameSessionModel.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ message: "Game session not found" });
        }

        if (session.status === "pending") {
            return res.status(400).json({ message: "Game has not started" });
        }

        if (session.status === "ended") {
            return res.status(400).json({ message: "Game session already ended" });
        }

        next();
    }
    catch (error) {
        res.status(400).json({ message: "Validation error" });
    }
};



module.exports = {
    ValidateCreateSession,
    ValidateQuestion,
    ValidateStartSession,
    ValidateAttempt,
    ValidateEndSession
};
