const joi = require('joi');
const gameSessionModel = require('../models/game_session.model');
const playerModel = require('../models/player.model');



const ValidateCreateSession = async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().alphanum(),
        type: joi.string().valid('public', 'private').required(),
        duration: joi.number().integer().min(10).max(300), 
    });

    try {
        await schema.validateAsync(req.body);

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
