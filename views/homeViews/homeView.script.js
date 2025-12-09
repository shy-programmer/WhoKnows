const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const user = sessionStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        document.getElementById('username-display').textContent = userData.username;
    } else {
        window.location.href = '/index.html';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/index.html';
});

document.getElementById('join-game-btn').addEventListener('click', () => {
    document.getElementById('join-game-form').style.display = 'block';
});

document.getElementById('public-option-btn').addEventListener('click', async () => {
    await gameType('public');
});

document.getElementById('private-option-btn').addEventListener('click', async () => {
    await gameType('private');
});


document.getElementById('submit-join-game-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.target;
    btn.disabled = true;
    const sessionCode = document.getElementById('sessionId-input').value.trim();   
    if (!sessionCode) {
            alert('Please enter a session Code');
            return;
    }
         try {
            const token = sessionStorage.getItem('token');
            if (!token) {
        alert('Please log in again');
        window.location.href = '/index.html';
        return;
    }
            const response = await fetch(`/game-sessions/${sessionCode}/join`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const result = await response.json();
            console.log('Join game response:', result);
            if (response.ok) {
                sessionStorage.setItem('GameSession', JSON.stringify({
                    id: result.data.session.id,
                    mongoId: result.data.session._id,
                    type: result.data.session.type,
                    gameMasterID: result.data.session.gameMasterID,
                    status: result.data.session.status
                }));
                socket.emit('update-player-info', sessionStorage.getItem('GameSession'));
                window.location.href = `/game.html`;
            }
            else {
                alert(result.message || 'Error joining game');
                btn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong!: ' + err.message);
            btn.disabled = false;
        }
});

document.getElementById('cancel-join-game-btn').addEventListener('click', () => {
    document.getElementById('join-game-form').style.display = 'none';
});

socket.on('public-games-updated', (gamesList) => {
    console.log('public games list:', gamesList);
    const publicGamesUl = document.getElementById('public-games-ul');
    publicGamesUl.innerHTML = ''; 
    gamesList.forEach(game => {
        const li = document.createElement('li');
        li.textContent = `Game ID: ${game.id} | Status: ${game.status}`;
        publicGamesUl.appendChild(li);
    });
});


const gameType = async (type) => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
        alert('Please log in again');
        window.location.href = '/index.html';
        return;
        }
        const response = await fetch('/game-sessions/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type })
        });
        const result = await response.json();
        if (response.ok) {
            sessionStorage.setItem('GameSession', JSON.stringify({
                id: result.data.session.id,
                mongoId: result.data.session._id,
                type: result.data.session.type,
                gameMasterID: result.data.session.gameMasterID,
                status: result.data.session.status
            }));
            if (type === 'public') {
                socket.emit('update-public-games');
            }
            
            window.location.href = `/game.html`;
            socket.emit('update-player-info', sessionStorage.getItem('GameSession'));

        } else {
            alert(result.message || `Error creating ${type} game session`);
        }   
    } catch (err) {
        console.error(err);
        alert('Something went wrong!: ' + err.message);
    }
};

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    socket.emit('update-public-games');
});
