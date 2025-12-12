const userController = require('../controllers/user.controller');
const {ValidateNewUser, ValidateLogin} = require('../validators/user.validator');
const userMiddleware = require('../middlewares/user.middleware');
const express = require('express');
const router = express.Router();

router.post('/signup', ValidateNewUser, userController.signUpUser);
router.post('/login', ValidateLogin, userController.loginUser);
router.get('/profile/:userId', userController.getProfile);
router.use(userMiddleware.Authenticate);
router.put('/profile/:userId', userController.updateProfile);
router.delete('/profile/:userId', userController.DeleteUser);

module.exports = router;

// Validators, controllers