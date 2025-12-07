const jwtTool = require('../utils/jwt');
const joi = require('joi');
const userModel = require('../models/user.model');

const Authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwtTool.decode(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const ValidateNewUser = async (req, res, next) => {
    const schema = joi.object({
        username: joi.string().alphanum().min(3).max(30).required(),
        password: joi.string().min(6).required()
    });
    try {
        await schema.validateAsync(req.body);
        const existingUsername = await userModel.findOne({ username: req.body.username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        next();
    }
    catch (error) {
        res.status(400).json({ message: error.details ? error.details[0].message : 'Validation error' });
    }
};


module.exports = {
    Authenticate,
    ValidateNewUser
}