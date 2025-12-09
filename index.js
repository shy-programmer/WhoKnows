const express = require('express');
const app = express();
const {Server} = require('socket.io');
const {createServer} = require('node:http');
const {join} = require('node:path');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { connect } = require('./config/database');
connect();
const PORT = process.env.PORT || 3000;
const gameSessionModel = require('./models/game_session.model');
const userModel = require('./models/user.model');
const playerModel = require('./models/player.model');
const userRoutes = require('./routes/user.route');
const gameSessionRoutes = require('./routes/game_session.route');
const path = require('node:path');

const server = createServer(app);
const io = new Server(server);

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(join(__dirname, 'views')));
app.use(cors());

app.use('/users', userRoutes);
app.use('/game-sessions', gameSessionRoutes);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', async (gameSession) => {
    socket.join(gameSession.id);
    const playersDocs = await playerModel.find({ sessionId: gameSession.mongoId }).populate('userId', 'username');
    const players = playersDocs.map(p => ({
        playerId: p._id.toString(),
        username: p.userId.username,
        score: p.score
    }));
    io.to(gameSession.id).emit('players-updated', players);
    console.log(`Socket ${socket.id} joined game ${gameSession.id}`);
  });

  socket.on('update-public-games', async (newSession) => {
    const publicGames = await gameSessionModel.find({ type: 'public' });
    const gamesList = publicGames.map(session => ({
        id: session.id,
        mongoId: session._id,
        status: session.status,
    }));
    console.log('Emitting public games update:', gamesList);
    io.emit('public-games-updated', gamesList);
    console.log('Public games list updated');
  }
  );

  socket.on('chat message', ({ gameSession, message }) => {
    console.log(`Game ${gameSession.id}:`, message);

    io.to(gameSession.id).emit('chat message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
