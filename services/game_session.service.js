const game_sessionModel = require('../models/game_session.model');
const playerModel = require('../models/player.model');

const createGameSession = async (session_data, auth) => {
    const newSession = game_sessionModel.create({
        ...session_data,
        gameMasterID: auth.userId,
        players: [auth.userId]
    });
    return {
        code: 201,
        message: 'Game session created successfully',
        data: newSession
    }
}

const getAllGameSessions = async () => {
    const sessions = await game_sessionModel.find();
    return {
        code: 200,
        message: 'Game sessions retrieved successfully',
        data: sessions
    }
}

const getGameSessionById = async (sessionId) => {
    const session = await game_sessionModel.findById(sessionId);
    if (!session) {
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    return {
        code: 200,
        message: 'Game session retrieved successfully',
        data: session
    }
}   

const updateGameSession = async (sessionId, updateData) => {
    const updatedSession = await game_sessionModel.findByIdAndUpdate(sessionId, updateData, { new: true });
    if (!updatedSession) {
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    return {
        code: 200,
        message: 'Game session updated successfully',
        data: updatedSession
    }
}

const joinGameSession = async (sessionId, auth) => {
    const session = await game_sessionModel.findById(sessionId);
    if (!session) {
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    if (session.players.includes(auth.userId)) {
        return {
            code: 400,
            message: 'User already in the game session',
        }
    }
    if (session.status === 'active') {
        return {
            code: 400,
            message: 'Cannot join an active game session',
        }
    }
    session.players.push(auth.userId);
    await session.save();
    return {
        code: 200,
        message: 'User joined the game session successfully',
        data: session
    }
}

const leaveGameSession = async (sessionId, auth) => {
    const session = await game_sessionModel.findById(sessionId);
    if (!session) {
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    const playerIndex = session.players.indexOf(auth.userId);
    if (playerIndex === -1) {
        return {
            code: 400,
            message: 'User not in the game session',
        }
    }
    session.players.splice(playerIndex, 1);
    await session.save();
    return {
        code: 200,
        message: 'User left the game session successfully',
        data: session //?
    }
}

const addQuestionToSession = async (sessionId, questionData, auth) => {
    const session = await game_sessionModel.findById(sessionId);
    if (!session) { 
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    if (session.gameMasterID.toString() !== auth.userId) {
        return {
            code: 403,
            message: 'Only the game master can add questions',
        }
    }
    session.question = questionData.question; //validators
    session.answer = questionData.answer; //validators
    await session.save();
    return {
        code: 200,
        message: 'Question added to the game session successfully',
        data: session
    }
}

const startGameSession = async (sessionId, auth) => {
    const session = await game_sessionModel.findById(sessionId);
    if (!session) {
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    if (session.gameMasterID.toString() !== auth.userId) {
        return {
            code: 403,
            message: 'Only the game master can start the game session',
        }
    }
    session.status = 'active';
    await session.save();
    return {
        code: 200,
        message: 'Game session started successfully',
        data: session
    }
}

const attemptQuestionInSession = async (sessionId, attemptData, auth) => {
    const session = await game_sessionModel.findById(sessionId);
    if (!session) {
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    if (session.status !== 'active') {
        return {
            code: 400,
            message: 'Game session is not active',
        }
    }
    if (attemptData.answer === session.answer) {
        session.winnerID = auth.userId;
        session.status = 'ended';
        await session.save();
        return {
            code: 200,
            message: 'Correct answer! You have won the game session.',
            data: session
        }
    }
    return {
        code: 200,
        message: 'Incorrect answer. Try again!',
        data: session
    }
}

// const deleteGameSession = async (sessionId) => {
