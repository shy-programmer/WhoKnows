const gameSessionService = require('../services/game_session.service'); 
const gameSessionModel = require('../models/game_session.model');

const createGameSession = async (req, res) => {
    try {
        const session_data = req.body;
        const auth = req.user;
        const response = await gameSessionService.createGameSession(session_data, auth);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllPublicGameSessions = async (req, res) => {
    try {
        const response = await gameSessionService.getAllPublicGameSessions();
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getGameSessionById = async (req, res) => {
    try {
        sessionId = req.params.sessionId;
        const response = await gameSessionService.getGameSessionById(sessionId);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateGameSession = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const updateData = req.body;
        const auth = req.user;
        const response = await gameSessionService.updateGameSession(sessionId, updateData, auth);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const joinGameSession = async (req, res) => {
    try {
        const sessionCode = req.body.id;
        const session = await gameSessionModel.findOne({ id: sessionCode});
        if (!session) {
            res.status(404).json({ message: 'Game session not found' });
        }
        const auth = req.user;
        const response = await gameSessionService.joinGameSession(session._id, auth);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const leaveGameSession = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const auth = req.user;
        const response = await gameSessionService.leaveGameSession(sessionId, auth);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addQuestionToSession = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const questionData = req.body;
        const auth = req.user;
        const response = await gameSessionService.addQuestionToSession(sessionId, questionData, auth);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const startGameSession = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const auth = req.user;
        const response = await gameSessionService.startGameSession(sessionId, auth);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

const attemptQuestionInSession = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const attemptData = req.body;
        const auth = req.user;
        const response = await gameSessionService.attemptQuestionInSession(sessionId, attemptData, auth);
        res.status(response.code).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }   
};



module.exports = {
    createGameSession,
    getAllPublicGameSessions,
    getGameSessionById,
    updateGameSession,
    joinGameSession,
    leaveGameSession,
    addQuestionToSession,
    startGameSession,
    attemptQuestionInSession
};