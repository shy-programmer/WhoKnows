const express = require('express');
const app = express();
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const { join } = require('node:path');
const dotenv = require('dotenv').config();
const cors = require('cors');

const { connect } = require('./config/database');
connect();
const disconnectTimers = new Map();
const socketUsers = new Map();


const PORT = process.env.PORT || 3000;
const gameSessionModel = require('./models/game_session.model');
const playerModel = require('./models/player.model');

const userRoutes = require('./routes/user.route');
const gameSessionRoutes = require('./routes/game_session.route');
const userModel = require('./models/user.model');

const {leaveGameSession} = require('./services/game_session.service')

const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(join(__dirname, 'views')));
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/users', userRoutes);
app.use('/game-sessions', gameSessionRoutes);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});


async function updateSession(sessionMongoId, sessionCode, userId) {
    const sessionDoc = await gameSessionModel.findById(sessionMongoId);

    if (!sessionDoc) return;

    const currentPlayer = await playerModel.findOne({
        userId,
        sessionId: sessionMongoId
    });

    const playerDocs = await playerModel
      .find({ sessionId: sessionMongoId })
      .populate('userId', 'username');

    const players = playerDocs.map(p => ({
        playerId: p._id.toString(),
        userId: p.userId._id,
        username: p.userId.username,
        score: p.score,
        inGame: p.inGame,
    }));
    

    io.to(sessionCode).emit('session-updated', {
        id: sessionDoc.id,
        mongoId: sessionDoc._id.toString(),
        gameMasterID: sessionDoc.gameMasterID.toString(),
        status: sessionDoc.status,
        duration: sessionDoc.duration,
        question: sessionDoc.question,
        answer: sessionDoc.answer,
        currentPlayer,
        players
    });

    console.log(`game ${sessionCode} updated`);
}

const activeTimers = {};

const  startTimer = async (session) => {

    const sessionId = session.mongoId;
    const roomId = session.id;

    // Prevent duplicate timers
    if (activeTimers[sessionId]) {
        clearInterval(activeTimers[sessionId]);
    }

    let timeLeft = session.duration;

    activeTimers[sessionId] = setInterval(async () => {
        const checkSession = await gameSessionModel.findOne({_id : sessionId})
        io.to(roomId).emit("timer-update", { 
            remaining: timeLeft,
            question: checkSession.question
         });

        if (checkSession.status !== 'active') {
            clearInterval(activeTimers[sessionId]);
            delete activeTimers[sessionId];
            timeLeft = '0'
            io.to(roomId).emit("timer-update", { remaining: timeLeft });
            
            io.to(roomId).emit('endGame', sessionId);
            
            return
        }

        if (timeLeft <= 0) {
            clearInterval(activeTimers[sessionId]);
            delete activeTimers[sessionId];
            timeLeft = ''
            io.to(roomId).emit("timer-update", { remaining: timeLeft });
            io.to(checkSession.id).emit("send chat", {
                message: `TIME UP! \n The correct answer was: ${checkSession.answer.toUpperCase()}`,
                user: 'alert only'
            });
            io.to(roomId).emit('endGame', sessionId);
            
            return
        }

        timeLeft--;
    }, 1000);
}



io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('updateNow', async ({ mongoId, id, userId }) => {
    const updated = await gameSessionModel.findById(mongoId);
    if (updated) {
        await updateSession(updated._id.toString(), updated.id, userId);
    }
    
    });

    socket.on('register-user', ({ userId, sessionId }) => {
        socketUsers.set(socket.id, { userId, sessionId });

        if (disconnectTimers.has(userId)) {
            clearTimeout(disconnectTimers.get(userId));
            disconnectTimers.delete(userId);
            console.log(`Reconnect: cancelled removal for ${userId}`);
        }
    });

    socket.on('startTimer', async (session) => {
        startTimer(session);
    })

    
    socket.on('join-game', async (session) => {
        socket.join(session.id);
        console.log(`Socket ${socket.id} joined ${session.id}`);
    });

    socket.on('leave-game', async (session) => {
        socket.leave(session.id);
        console.log(`Socket ${socket.id} left ${session.id}`);
    });

    socket.on('chat message', async ({ gameSession, message, senderId }) => {
        let sessionDoc = await gameSessionModel.findById(gameSession.mongoId);
let userObj = null;
let playerObj = null;

    userObj = await userModel.findById(senderId);
    playerObj = await playerModel.findOne({ 
        userId: senderId,
        sessionId: gameSession.mongoId
     });

io.to(gameSession.id).emit("send chat", {
    session: sessionDoc,
    message,
    user: userObj,
    player: playerObj,
    type: 'chat'
});

        
        
    });

    socket.on("playerAttempt", async (data, ack) => {
        let sessionDoc = await gameSessionModel.findById(data.gameSession.mongoId);
let userObj = null;
let playerObj = null;

if (data.senderId !== "alert") {
    userObj = await userModel.findById(data.senderId);
    playerObj = await playerModel.findOne({ 
        userId: data.senderId,
        sessionId: data.gameSession.mongoId
     });
}
    io.to(data.gameSession.id).emit("send chat", {
        session: sessionDoc,
        message: data.message,
        user: userObj || 'alert only',
        player: playerObj || null,
        alert: data.result.message,
        type: 'attempt'
    });

    if (ack) {
        ack()
    }

});


    socket.on('update-public-games', async () => {
        const publicGames = await gameSessionModel
            .find({ type: 'public' })
            .sort({createdAt: -1});

        const gamesList = publicGames.map(s => ({
            id: s.id,
            mongoId: s._id,
            status: s.status,
        }));

        io.emit('public-games-updated', gamesList);
    });

    socket.on('disconnect', () => {
    const info = socketUsers.get(socket.id);
    if (!info) return;

    const { userId, sessionId } = info;
    socketUsers.delete(socket.id);

    console.log(`Socket disconnected for user ${userId}`);

    const timeout = setTimeout(async () => {
        console.log(`User ${userId} did not return — removing from game`);

        
        await leaveGameSession(sessionId, { id : userId })


        const sessionDoc = await gameSessionModel.findById(sessionId);
        if (sessionDoc) {
            await updateSession(
                sessionDoc._id.toString(),
                sessionDoc.id,
                userId
            );

        }

        disconnectTimers.delete(userId);

    }, 30_000); 

    disconnectTimers.set(userId, timeout);
});

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
