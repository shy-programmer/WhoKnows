const game_sessionModel = require('../models/game_session.model');
const playerModel = require('../models/player.model');

const createGameSession = async (session_data, auth) => {
   
    const newSession = await game_sessionModel.create({
        ...session_data,
        gameMasterID: auth.id,
        players: [],
        admins: [auth.id]
    });
     const newPlayer = await playerModel.create({
        userId: auth.id,
        sessionId: newSession._id,
    });

    newSession.players.push(newPlayer._id);
    await newSession.save();

    return {
        code: 201,
        message: 'Game session created successfully',
        data: {
            session: newSession,
            player: newPlayer
        }
    }
}

const getAllPublicGameSessions = async () => {
    const sessions = await game_sessionModel.find({ type: 'public' });
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
    const allowedFields = ['name', 'type', 'duration'];
    const filteredData = {};

    for (let key of allowedFields) {
        if (updateData[key] !== undefined) {
            filteredData[key] = updateData[key];
        }
    }

    const updatedSession = await game_sessionModel.findByIdAndUpdate(sessionId, filteredData, { new: true });
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

    const playerExistsInSession = existingPlayer 
        ? session.players.map(id => id.toString()).includes(existingPlayer._id.toString())
        : false;

    if (existingPlayer && playerExistsInSession && existingPlayer.inGame) {
        return {
            code: 400,
            message: 'User already in the game session',
        }
    }
    else if (existingPlayer && playerExistsInSession && !existingPlayer.inGame) {
        existingPlayer.inGame = true;
        await existingPlayer.save();
        return {
        code: 200,
        message: 'User re-joined the game session successfully',
        data: {
            session: session,
            player: existingPlayer
        }
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
        data: {
            session: session,
            player: newPlayer
        }
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
  
    const player = await playerModel.findOne({
        userId: auth.id,
        sessionId: sessionId
    });
    if (!player || !player.inGame) {
        return {
            code: 400,
            message: 'User not in the game session',
        }
    }
    player.inGame = false;
    await player.save();
    const activePlayers = await playerModel.find({
        sessionId: sessionId,
        inGame: true
    });
    

    if (activePlayers.length === 0) {
        await game_sessionModel.findByIdAndDelete(sessionId);
        await playerModel.deleteMany({ sessionId: sessionId });
        return {
            code: 200,
            message: 'User left the game session and session deleted as no players remain',
        }
    }
    else if (session.gameMasterID.toString() === auth.id) {
        session.gameMasterID = activePlayers[0].userId;
        await session.save();
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
    if (session.status === 'active') {
        return {
            code: 400,
            message: 'Cannot add questions to an active game session',
        }
    };
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
    const activePlayers = await playerModel.find({
        sessionId: sessionId,
        inGame: true
    });
    if (activePlayers.length < 2) {
        return {
            code: 400,
            message: 'At least two active players are required to start the game session',
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
    for (const player of activePlayers) {
        player.attemptsLeft = 3;
        await player.save();
    }
    session.winnerID = null; 
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

    if (!player) {
    return { code: 403, message: 'User not part of the game session' };
}
    const isPlayerInSession = session.players.map(id => id.toString()).includes(player._id.toString());

    if (!isPlayerInSession) {
    return { code: 403, message: 'User not part of the game session' };
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
        player.score += 10;
        session.status = 'pending';
        await session.save();
        await player.save();
        const otherPlayers = await playerModel.find({
            sessionId: sessionId,
            inGame: true,
            userId: { $ne: session.gameMasterID }
        });
        if (otherPlayers.length > 0) {
            session.gameMasterID = otherPlayers[0].userId;
            await session.save();
        }
        
        return {
            code: 200,
            message: 'Correct answer! You have won the game session.',
            data: session
        }
    }
    
    player.attemptsLeft -= 1;
    await player.save();
    const finishedAttempts = await playerModel.find({
        sessionId: sessionId,
        inGame: true,
        attemptsLeft: { $gt: 0 }
    });
    if (finishedAttempts.length === 0) {
        session.status = 'pending';
        await session.save();
        const otherPlayers = await playerModel.find({
            sessionId: sessionId,
            inGame: true,
            userId: { $ne: session.gameMasterID }
        });
        if (otherPlayers.length > 0) {
            session.gameMasterID = otherPlayers[0].userId;
            await session.save();
        }
        return {
            code: 200,
            message: 'No attempts left for any player. Game session ended.',
            data: session
        }
    }
    return {
        code: 200,
        message: 'Incorrect answer. Try again!',
        data: session
    }
}

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