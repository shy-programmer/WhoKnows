const express = require('express');
const app = express();
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const { join } = require('node:path');
const dotenv = require('dotenv').config();
const cors = require('cors');

const { connect } = require('./config/database');
connect();

const PORT = process.env.PORT || 3000;
const gameSessionModel = require('./models/game_session.model');
const playerModel = require('./models/player.model');

const userRoutes = require('./routes/user.route');
const gameSessionRoutes = require('./routes/game_session.route');

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


async function updateSession(sessionMongoId, sessionCode) {
    const sessionDoc = await gameSessionModel.findById(sessionMongoId);

    if (!sessionDoc) return;

    const playerDocs = await playerModel
      .find({ sessionId: sessionMongoId })
      .populate('userId', 'username');

    const players = playerDocs.map(p => ({
        playerId: p._id.toString(),
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
        players
    });

    console.log(`Emitted session-updated for game ${sessionCode}`);
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
        io.to(roomId).emit("timer-update", { remaining: timeLeft });

        if (checkSession.status !== 'active') {
            clearInterval(activeTimers[sessionId]);
            delete activeTimers[sessionId];
            timeLeft = ''
            io.to(roomId).emit("timer-update", { remaining: timeLeft });
            return
        }

        if (timeLeft <= 0) {
            clearInterval(activeTimers[sessionId]);
            delete activeTimers[sessionId];
            timeLeft = ''
            io.to(roomId).emit("timer-update", { remaining: timeLeft });
            io.to(roomId).emit('endGame', sessionId);

            return;
        }

        timeLeft--;
    }, 1000);
}



io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('updateNow', async ({ mongoId }) => {
    const updated = await gameSessionModel.findById(mongoId);
    if (updated) {
        await updateSession(updated._id.toString(), updated.id);
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
        io.to(gameSession.id).emit('chat message', {message, senderId});
    });

    socket.on('update-public-games', async () => {
        const publicGames = await gameSessionModel.find({ type: 'public' });

        const gamesList = publicGames.map(s => ({
            id: s.id,
            mongoId: s._id,
            status: s.status,
        }));

        io.emit('public-games-updated', gamesList);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
