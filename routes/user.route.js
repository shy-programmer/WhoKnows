const userController = require('../controllers/user.controller');
const {updateValidator, signupValidator} = require('../validators/user.validator');
const userMiddleware = require('../middlewares/user.middleware');
const express = require('express');
const router = express.Router();

router.post('/signup', signupValidator, userController.signup);
router.post('/login', userController.login);
router.get('/profile/:userId', userController.getProfile);
router.use(userMiddleware.Authenticate);
router.put('/profile/:userId', updateValidator, userController.updateProfile);
router.delete('/profile/:userId/recycle', userController.softDeleteUser);
router.delete('/profile/:userId', userController.hardDeleteUser);

module.exports = router;

// Validators, controllers