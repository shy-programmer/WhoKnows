const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const encode = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const decode = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { encode, decode }; 