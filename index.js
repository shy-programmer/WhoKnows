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
const userRoutes = require('./routes/user.route');
const gameSessionRoutes = require('./routes/game_session.route');

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

  socket.on('chatMessage', (msg) => {
        console.log('Message received:', msg);

        // Broadcast message to all connected clients
        io.emit('chatMessage', msg);
    });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
