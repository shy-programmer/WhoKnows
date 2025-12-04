const game_sessionModel = require('../models/game_session.model');
const playerModel = require('../models/player.model');

const createGameSession = async (session_data, auth) => {
    const newPlayer = await playerModel.create({
        userId: auth.id
    });
    const newSession = game_sessionModel.create({
        ...session_data,
        gameMasterID: auth.id,
        players: [newPlayer._id],
        admins: [auth.id]
    });

    newPlayer.sessionId = newSession._id;
    await newPlayer.save();

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

const updateGameSession = async (sessionId, updateData, auth) => {
    const chosenSession = await game_sessionModel.findById(sessionId);
    if (!chosenSession) {
        return {
            code: 404,
            message: 'Game session not found',
        }
    }
    if (!chosenSession.admins.includes(auth.id)) {
        return {
            code: 403,
            message: 'Only admins can update the game session',
        }
    }
    const updatedSession = await game_sessionModel.findByIdAndUpdate(sessionId, updateData, {new: true});
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

    if (session.status === 'active') {
        return {
            code: 400,
            message: 'Cannot join an active game session',
        }
    }

    // check if player already in THIS session
    const existingPlayer = await playerModel.findOne({
        userId: auth.id,
        sessionId: sessionId
    });

    if (existingPlayer && session.players.includes(existingPlayer._id) && existingPlayer.inGame) {
        return {
            code: 400,
            message: 'User already in the game session',
        }
    }
    else if (existingPlayer && session.players.includes(existingPlayer._id) && !existingPlayer.inGame) {
        existingPlayer.inGame = true;
        await existingPlayer.save();
        return {
            code: 200,
            message: 'User re-joined the game session successfully',
            data: session
        }
    }

    const newPlayer = await playerModel.create({
        userId: auth.id,
        sessionId: sessionId
    });

    session.players.push(newPlayer._id);
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
    const playerIndex = session.players.indexOf(auth.id);
    if (playerIndex === -1) {
        return {
            code: 400,
            message: 'User not in the game session',
        }
    }
    const player = await playerModel.findOne({
        userId: auth.id,
        sessionId: sessionId
    });
    player.inGame = false;
    await player.save();
    const activePlayers = await playerModel.find({
        sessionId: sessionId,
        inGame: true
    });
    

    if (activePlayers.length === 0) {
        await game_sessionModel.findByIdAndDelete(sessionId);
        return {
            code: 200,
            message: 'User left the game session and session deleted as no players remain',
        }
    }
    if (session.gameMasterID.toString() === auth.id) {
        session.gameMasterID = activePlayers[0]._id;
    }
    
    return {
        code: 200,
        message: 'User left the game session successfully',
        data: session 
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
    if (session.gameMasterID.toString() !== auth.id) {
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
    if (session.gameMasterID.toString() !== auth.id) {
        return {
            code: 403,
            message: 'Only the game master can start the game session',
        }
    }
    if (!session.players || session.players.length < 2) {
        return {
            code: 400,
            message: 'At least two players are required to start the game session',
        }
    }
    if (!session.question || !session.answer) {
        return {
            code: 400,
            message: 'Cannot start session without a question and answer',
        }
    }
    if (session.status === 'active') {
        return {
            code: 400,
            message: 'Game session is already active',
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
    const player = await playerModel.findOne({
        userId: auth.id,
        sessionId: sessionId
    });
    if (!session.players.includes(player._id) || !player.inGame) {
        return {
            code: 403,
            message: 'User not part of the game session',
        }
    }
    if (player.attemptsLeft <= 0) {
        return {
            code: 400,
            message: 'No attempts left',
        }
    }
    if (!attemptData.answer) {
        return {
            code: 400,
            message: 'Answer is required',
        }
    }
    if (session.winnerID) {
        return {
            code: 400,
            message: 'Game session has already ended',
        }
    }
    if (attemptData.answer === session.answer) {
        session.winnerID = auth.id;
        session.status = 'ended';
        await session.save();
        return {
            code: 200,
            message: 'Correct answer! You have won the game session.',
            data: session
        }
    }
    
    player.attemptsLeft -= 1;
    await player.save();
    return {
        code: 200,
        message: 'Incorrect answer. Try again!',
        data: session
    }
}

module.exports = {
    createGameSession,
    getAllGameSessions,
    getGameSessionById,
    updateGameSession,
    joinGameSession,
    leaveGameSession,
    addQuestionToSession,
    startGameSession,
    attemptQuestionInSession
};