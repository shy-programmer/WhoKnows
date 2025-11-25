const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const { connect } = require('./config/database');
connect();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
