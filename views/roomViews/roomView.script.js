const socket = io();
let session = null;
let user = null;
let alertColour = null;



const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const leaveBtn = document.getElementById('leave-room-btn');
const questionForm = document.getElementById('question-form');
const guessForm = document.getElementById('guess-form');
const gameMasterInfo = document.getElementById('gameMaster-info');
const guess = document.getElementById('guess-attempt');


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

        const result = await response.json()

        console.log("HERE:", result)

      socket.emit("updateNow", {
            mongoId: sessionId,
            id: session.id,
            userId: user.id
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
        window.location.href = '/home.html';
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
    id: session.id,
    userId: user.id
});

    sessionStorage.removeItem('GameSession');
    window.location.href = '/home.html';
});

guessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = guess.value.trim();

    if (!msg) return
    if (msg && session.status !== 'active') {
        alert('Cannot make attempt, game is over')
    }

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
                        
                if (result.data.winnerID) { 
                socket.emit('playerAttempt', {
                    gameSession: session,
                    message: msg,
                    senderId: user.id,
                    result
                }, () => {
                    socket.emit('playerAttempt', {
                        gameSession: session,
                        message: `${user.username} WON!\nThe correct answer was: ${result.data.answer.toUpperCase()}`,
                        senderId: 'alert',
                        result
                    });
                });

                }
                else if (result.data.status === 'pending') {
                socket.emit('playerAttempt', {
                gameSession: session,
                message: msg,
                senderId: user.id,
                result
            }, () => {
                socket.emit('playerAttempt', {
                gameSession: session,
                message: `GAME OVER! (No Winner); \n The correct answer was: ${result.data.answer.toUpperCase()}`,
                senderId: 'alert',
                result
            });
            });       
                
                }
                else
                {
                    socket.emit("playerAttempt", {
                    gameSession: session,
                    message: msg,
                    senderId: user.id,
                    result
                });
            }

            socket.emit('updateNow', {
                            mongoId: session.mongoId,
                            id: session.id,
                            userId: user.id
                        });
                                
                    } else {
                        socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id,
    userId: user.id
});
                        alert(result.message || 'Error submitting attempt');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Something went wrong: ' + err.message);
                }
         
        }

})

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();

    if (!msg) return;

            socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id,
    userId: user.id
});
        socket.emit('chat message', {
            gameSession: session,
            message: msg,
            senderId: user.id
        });
        
        
});

socket.on('send chat', (data) => {
    const mainDiv = document.createElement('div');

    const isAlert = data.user === "alert only";
    const isSender = data.user?._id === user.id;

    if (isSender) {
        mainDiv.classList.add("sender");
    }

    if (isAlert) {
        mainDiv.classList.add("alert-message");
        mainDiv.textContent = data.message;
    }
    else if (data.type === 'attempt') {
        mainDiv.classList.add("msg-background");

        const nameDiv = document.createElement("div");
        const msgDiv = document.createElement("div");

        nameDiv.classList.add("username");
        msgDiv.classList.add("user-message");

        if (data.session.gameMasterID === data.user._id) {
            nameDiv.textContent = isSender
                ? "YOU {Game Master}"
                : `${data.user.username} {Game Master}`;
        } else {
            nameDiv.textContent = isSender
                ? `YOU {Attempts Left: ${data.player?.attemptsLeft}}`
                : `${data.user.username} {Attempts Left: ${data.player?.attemptsLeft}}`;
        }

        msgDiv.textContent = data.message;

        mainDiv.append(nameDiv, msgDiv);

        if (data.alert) {
            const alertDiv = document.createElement("div");
            alertDiv.classList.add("alert-message");
            alertDiv.textContent = data.alert;
            mainDiv.appendChild(alertDiv);
        }
    }
    else {
        mainDiv.classList.add("msg-background");

        const nameDiv = document.createElement("div");
        const msgDiv = document.createElement("div");

        nameDiv.classList.add("username");
        msgDiv.classList.add("user-message");

        nameDiv.textContent = isSender ? "YOU" : data.user.username;
        msgDiv.textContent = data.message;

        mainDiv.append(nameDiv, msgDiv);
    }

    messages.appendChild(mainDiv);
    messages.scrollTop = messages.scrollHeight;

    if (isSender && data.type === 'chat') input.value = "";
    if (isSender && data.type === 'attempt') guess.value = "";
});




socket.on('session-updated', (updated) => {
    console.log('SESSION UPDATED:', updated);

    sessionStorage.setItem('GameSession', JSON.stringify(updated));
    session = updated;

    scoreList.innerHTML = '';
    updated.players.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="player-name">${p.username}:</span> <span class="player-score">${p.score}</span>`;
        if (p.userId === session.gameMasterID) {
            li.style.color = 'green'
            li.style.fontWeight = "bold";
        }
        else if (!p.inGame) li.style.color = 'red';
        scoreList.appendChild(li);
    });

    if (user.id === updated.gameMasterID && updated.status === 'pending') {
        questionForm.style.display = 'flex';
    } 
    
    else {
        questionForm.style.display = 'none';
    }

    if (updated.status === 'active') {
        if (user.id === updated.gameMasterID) {
            guessForm.style.display = 'none';
            gameMasterInfo.style.display = 'block';
        } else {
            gameMasterInfo.style.display = 'none'
            guessForm.style.display = 'flex';
        }

    } else {
        guessForm.style.display = 'none'
        gameMasterInfo.style.display = 'none'
    }

    if (
    updated.currentPlayer &&
    updated.currentPlayer.userId === user.id &&
    updated.currentPlayer.inGame === false
) {
    window.location.href = '/home.html';
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

            questionForm.style.display = "none";
            document.getElementById('question-input').value = "";
            document.getElementById('answer-input').value = "";
            
        socket.emit('startTimer', session);

            socket.emit('playerAttempt', {
                gameSession: session,
                message: `QUESTION: ${question}`,
                senderId: 'alert',
                result
                })
            socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id,
    userId: user.id
});

        } catch (err) {
            console.error(err);
            alert("Something went wrong: " + err.message);
        }
        
    });
}

socket.on("timer-update", (data) => {
    const chatBackground = document.getElementById("messages");
    chatBackground.style.backgroundColor = "#06c015"
    const timerDisplay = document.getElementById("timer-display");
    const questionAsked = document.getElementById("session-question");
    timerDisplay.style.display = 'block'
    questionAsked.style.display = 'block'
    timerDisplay.textContent = `${data.remaining}`;
    questionAsked.textContent = `${data.question}`
    
})
socket.on('endGame', (sessionId) => {
    const chatBackground = document.getElementById("messages");
    chatBackground.style.backgroundColor = "#F9F9F9"
    const timerDisplay = document.getElementById("timer-display");
    const questionAsked = document.getElementById("session-question");
    timerDisplay.style.display = 'none'
    questionAsked.style.display = 'none'
    
    endFunction(sessionId)
});



socket.on('connect', () => {
    socket.emit('updateNow', {
    mongoId: session.mongoId,
    id: session.id,
    userId: user.id
});
    socket.emit('join-game', session);
    socket.emit('update-public-games');
    socket.emit('register-user', {
        userId: user.id,
        sessionId: session.mongoId
    });
});


socket.on('disconnect', () => {
    console.log('Disconnected from server');
});


