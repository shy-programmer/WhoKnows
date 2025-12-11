const socket = io();
let session = null;
let user = null;
let countdownInterval = null;


const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const leaveBtn = document.getElementById('leave-room-btn');
const questionForm = document.getElementById('question-form');

const playersList = document.getElementById('players');
const scoreList = document.getElementById('scoreboard');

const endFunction = async (sessionId) => {
    try {
        const response = await fetch(`/game-sessions/${sessionId}/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        });

        const result = await response.json();
        console.log("🔥 END GAME RESULT:", result);

        if (response.ok) {
            
            socket.emit('chat message', {
                gameSession: session,
                message: `${result.message} \n The correct answer was: ${result.data.answer.toUpperCase()}`,
                senderId: user.id
            });
        }

        socket.emit('updateNow', {
            mongoId: sessionId,
            id: session.id
        });



    } catch (err) {
        console.error("❌ Error ending game:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    session = JSON.parse(sessionStorage.getItem('GameSession'));
    user = JSON.parse(sessionStorage.getItem('user'));

    if (!session) {
        alert('No game session found. Join a game first.');
        window.location.href = '/index.html';
        return;
    }

    document.getElementById('game-session-id').textContent = session.id;
});

leaveBtn.addEventListener('click', async () => {
    await fetch(`/game-sessions/${session.mongoId}/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
    });

    socket.emit('leave-game', session);
    socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id
});

    sessionStorage.removeItem('GameSession');
    window.location.href = '/home.html';
});


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();

    if (!msg) return;

        socket.emit('chat message', {
            gameSession: session,
            message: msg,
            senderId: user.id
        });

        if (msg && session.status === 'active') {
            
                try {
                    const token = sessionStorage.getItem('token');
                    const response = await fetch(`/game-sessions/${session.mongoId}/attempt`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ answer: msg }),
                    });
                    const result = await response.json();
                    if (response.ok) {
                        socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id
});
                        socket.emit('chat message', {
                            gameSession: session,
                            message: `Attempt result: ${result.message}`,
                            senderId: user.id
                        });
                        
                        console.log('Attempt result:', result);
                        alert(result.message);
                        
                        
                        
                        
                    } else {
                        socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id
});
                        alert(result.message || 'Error submitting attempt');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Something went wrong: ' + err.message);
                }
         
        }
        
        
});

socket.on('chat message', (data) => {
    const li = document.createElement('li');
    li.textContent = data.message;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
    if (data.senderId === user.id) {
        input.value = '';
    }
    
});


socket.on('session-updated', (updated) => {
    console.log('SESSION UPDATED:', updated);

    sessionStorage.setItem('GameSession', JSON.stringify(updated));
    session = updated;

    


    playersList.innerHTML = '';
    updated.players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.username;
        if (!p.inGame) li.style.color = 'red';
        playersList.appendChild(li);
    });

    scoreList.innerHTML = '';
    updated.players.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="player-name">${p.username}:</span> <span class="player-score">${p.score}</span>`;
        if (!p.inGame) li.style.color = 'red';
        scoreList.appendChild(li);
    });

    if (user.id === updated.gameMasterID && updated.status === 'pending') {
        document.getElementById('question-input').value = "";
        document.getElementById('answer-input').value = "";
        questionForm.style.display = 'block';
    } else {
        questionForm.style.display = 'none';
    }

    if (updated.status === 'ended') {
        endFunction(updated.mongoId)
    }
});

if (questionForm) {
    questionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const question = document.getElementById('question-input').value.trim();
        const answer = document.getElementById('answer-input').value.trim();

        if (!question || !answer) {
            alert("Please enter both question and answer.");
            return;
        }

        try {
            const token = sessionStorage.getItem('token');

            const questionSession = await fetch(`/game-sessions/${session.mongoId}/question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question, answer })
            });

            const questionResult = await questionSession.json();
            if (!questionSession.ok) {
                alert(questionResult.message || "Error submitting question");
                return;
            }

            console.log("Question added:", questionResult);

            const response = await fetch(`/game-sessions/${session.mongoId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) {
                alert(result.message || "Error starting game");
                return;
            }

            console.log("Game started:", result);

            // Hide question form now that game has started
            questionForm.style.display = "none";

            alert("Game has started!");
            socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id
});
            socket.emit('startTimer', session);


        } catch (err) {
            console.error(err);
            alert("Something went wrong: " + err.message);
        }
        
    });
}

socket.on("timer-update", (data) => {
    const timerDisplay = document.getElementById("timer-display");

    if (!timerDisplay) return;

    timerDisplay.textContent = `${data.remaining}s`;
});
socket.on('endGame', (sessionId) => {
    endFunction(sessionId)
});





socket.on('connect', () => {
    socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id
});
    socket.emit('join-game', session);
    socket.emit('update-public-games');
});


socket.on('disconnect', () => {
    console.log('Disconnected from server');
});


