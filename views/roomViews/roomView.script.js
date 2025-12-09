const socket = io();
let session = null;

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const leaveBtn = document.getElementById('leave-room-btn')

document.addEventListener('DOMContentLoaded', () => {
    session = sessionStorage.getItem('GameSession');
    session = JSON.parse(session);
    if (!session) {
        alert('No game session found. Please join a game first.');
        window.location.href = '/index.html';
        return;
    }
    document.getElementById('game-session-id').textContent = session.id;
    });

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
        socket.emit('chat message', {
            gameSession: JSON.parse(sessionStorage.getItem('GameSession')),
            message
        });
        input.value = '';
    }
});

leaveBtn.addEventListener('click', async () => {
    const response = await fetch (`/game-sessions/${session.mongoId}/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    });
    const result = await response.json();
    if (response.ok) {
        console.log('Left game session successfully:', result.data.message);
    } else {
        console.error('Error leaving game session:', result.message || 'Unknown error');
    }
    sessionStorage.removeItem('GameSession');
    window.location.href = '/index.html';
})

socket.on('chat message', function(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

const playersList = document.getElementById('players');
const scoreList = document.getElementById('scoreboard');

socket.on('players-updated', (players) => {
  playersList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.username}`;
    playersList.appendChild(li);
  });
scoreList.innerHTML = '';
players.forEach(player => {
    const li = document.createElement('li');
    const username = document.createElement('span');
    username.className = 'player-name';
    username.textContent = `${player.username}: `;
    
    const score = document.createElement('span');
    score.className = 'player-score';
    score.textContent = player.score;
    
    li.appendChild(username);
    li.appendChild(score);
    scoreList.appendChild(li);
  });
});


socket.on('connect', () => {
    if (!session) return;
    socket.emit('join-game', session);
    console.log('Connected to server with ID:', socket.id);
    console.log('Joined game session:', session.id);
});

socket.on('disconnect', async () => {
    console.log('Disconnected from server');
}); 