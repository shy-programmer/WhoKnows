
    document.getElementById('login-toggle').addEventListener('click', () => {
        document.getElementById('login-form').classList.add('active');
        document.getElementById('signup-form').classList.remove('active');
        document.getElementById('login-toggle').classList.add('active');
        document.getElementById('signup-toggle').classList.remove('active');
    });
    document.getElementById('signup-toggle').addEventListener('click', () => {
        document.getElementById('signup-form').classList.add('active');
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('signup-toggle').classList.add('active');
        document.getElementById('login-toggle').classList.remove('active');
    });

    const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent default form submit

    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('signup-confirm-password').value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

        const payload = { username, password };

    try {
        const response = await fetch('/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
    sessionStorage.setItem('token', result.token);
    sessionStorage.setItem('user', JSON.stringify(result.data));
    signupForm.reset();
    window.location.href = "/home.html";

} else {
    alert(result.message || 'Error creating user');
}

    } catch (err) {
        console.error(err);
        alert('Something went wrong' + err.message);
    }
});

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent default form submit

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch('/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (response.ok) {
            // store token for authentication
            sessionStorage.setItem('token', result.token);
            sessionStorage.setItem('user', JSON.stringify(result.data));
            loginForm.reset();
            window.location.href = "/home.html";
        } else {
            alert(result.message || 'Error logging in');
        }
    } catch (err) {
        console.error(err);
        alert('Something went wrong');
    }
});

