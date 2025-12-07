const gameSessionController = require('../controllers/game_session.controller');
const {Authenticate} = require('../middlewares/user.middleware');
// const {createGameSessionValidator, updateGameSessionValidator} = require('../validators/game_session.validator');
const express = require('express');
const router = express.Router();

router.use(Authenticate);
router.post('/', gameSessionController.createGameSession);
router.get('/', gameSessionController.getAllPublicGameSessions);
router.get('/:sessionId', gameSessionController.getGameSessionById);
router.put('/:sessionId', gameSessionController.updateGameSession);
router.post('/:sessionId/join', gameSessionController.joinGameSession);
router.post('/:sessionId/leave', gameSessionController.leaveGameSession);
router.post('/:sessionId/question', gameSessionController.addQuestionToSession);
router.post('/:sessionId/start', gameSessionController.startGameSession);
router.post('/:sessionId/attempt', gameSessionController.attemptQuestionInSession);

module.exports = router;

// Validate
