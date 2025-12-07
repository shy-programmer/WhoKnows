document.getElementById('join-game-btn').addEventListener('click', () => {
    document.getElementById('join-game-form').style.display = 'block';
});

document.getElementById('submit-join-game-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const sessionId = document.getElementById('sessionId-input').value.trim();   
    if (!sessionId) {
            alert('Please enter a session ID');
            return;
    }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/game-sessions/:${sessionId}/join`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId })
            });
            const result = await response.json();
            if (response.ok) {
                window.location.href = `/game.html?gameId=${result.data.gameId}`;
            }
            else {
                alert(result.message || 'Error joining game');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong: ' + err.message);
        }
});

document.getElementById('cancel-join-game-btn').addEventListener('click', () => {
    document.getElementById('join-game-form').style.display = 'none';
});