const userController = require('../controllers/user.controller');
const {loginValidator, signupValidator} = require('../validators/user.validator');
const express = require('express');
const router = express.Router();

router.post('/login', loginValidator, userController.login);
router.post('/signup', signupValidator, userController.signup);
router.get('/profile/:userId', userController.getProfile);
router.put('/profile/:userId', userController.updateProfile);
router.delete('/profile/:userId', userController.deleteUser);

module.exports = router;