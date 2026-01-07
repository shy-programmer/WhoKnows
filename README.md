# 🎮 WhoKnows

**WhoKnows** is a real-time multiplayer quiz/guessing game built with **Node.js**, **Express**, and **Socket.IO**.  
Players join a shared game room, receive questions, submit answers, and compete in real time to see who knows best.

The game focuses on simplicity, real-time interaction, and fast feedback between players.

---

## 🌍 Live Demo

🚀 **Play WhoKnows live here:**  
👉 https://whoknows-f6uo.onrender.com/

> ⚠️ Note: Since this is hosted on Render’s free tier, the server may take a few seconds to wake up on first load.

---

## 🚀 Features

- Real-time multiplayer gameplay using Socket.IO
- Room-based game sessions
- Live question broadcasting
- Instant answer submission and evaluation
- Score tracking per player
- Server-side game logic
- Simple frontend with HTML, CSS, and JavaScript
- Local storage support for player data

---

## 🕹️ How to Play

1. Visit the live link or run the project locally
2. Create a user with a **username**
3. Create or Join a game room
4. Wait for the game to begin
5. Answer questions within the given time
6. Earn points for correct answers
7. The player with the highest score at the end wins

---

## 📜 Game Rules

- Each player must have a unique username in a room
- The current game master sets the question for the round
- All players receive the same questions simultaneously
- Answers must be submitted before time runs out
- Each player gets 3 attempts
- Points are awarded only for correct answers (10 points)
- The game ends when everyone leaves

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* Mongo DB
* JWT
* Socket.IO

### Frontend

* HTML
* CSS
* JavaScript

### Other

* dotenv (environment variables)
* MVC-inspired project structure

---

## 📁 Project Structure

```bash
WhoKnows/
│
├── config/         # App and environment configurations
├── controllers/    # Request event handlers
├── middlewares/    # Custom middleware logic
├── models/         # Game state and data models
├── routes/         # Express routes
├── services/       # Business logic
├── utils/          # Utility/helper functions
├── validators/     # Input validation logic
├── views/          # HTML templates / frontend pages
│
├── index.js        # Application entry point & Socket handlers
├── package.json    # Dependencies & scripts
├── example.env     # Sample environment variables
└── README.md
```

---

## ⚙️ Local Setup Instructions

Follow these steps to run **WhoKnows** on your local machine.

---

### 1️⃣ Prerequisites

Make sure you have:

* **Node.js** (v16+ recommended)
* **npm** (comes with Node.js)

Check versions:

```bash
node -v
npm -v
```

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/shy-programmer/WhoKnows.git
cd WhoKnows
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

This installs all required backend dependencies.

---

### 4️⃣ Configure Environment Variables

Create a `.env` file in the root directory and copy from `example.env`:

```env
PORT=3000
```

You may add additional variables later if needed.

---

### 5️⃣ Start the Development Server

```bash
node index.js
```

Or, if you use nodemon:

```bash
npm run dev
```

---

### 6️⃣ Open the App in Your Browser

```text
http://localhost:3000
```

You should now be able to play the game locally 🎉

---

## 🧠 How It Works (High-Level)

* Express serves the frontend and handles HTTP routing
* Socket.IO manages real-time communication between players
* When a player joins:

  * A socket connection is created
  * Player data is registered on the server
* Questions, answers, and scores are broadcast in real time
* The server maintains game state and validates all actions

---

## 🔐 Validation & Safety

* Inputs are validated using custom validators
* Game logic is handled server-side
* No sensitive data is stored on the client
* password is hashed

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 👤 Author

**Abdulazeez Arowolo**
GitHub: [https://github.com/shy-programmer](https://github.com/shy-programmer)
