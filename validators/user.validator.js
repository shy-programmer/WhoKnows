const joi = require('joi');
const userModel = require('../models/user.model')

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

const ValidateLogin = async (req, res, next) => {
    const schema = joi.object({
        username: joi.string().alphanum().min(3).max(30).required(),
        password: joi.string().min(6).required()
    });
    try {
        await schema.validateAsync(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({ message: error.details ? error.details[0].message : 'Validation error' });
    }
};
module.exports = { 
    ValidateNewUser,
    ValidateLogin 
};