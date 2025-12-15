const gameSessionController = require('../controllers/game_session.controller');
const {Authenticate} = require('../middlewares/user.middleware');
const sessionValidator = require('../validators/game_session.validator');
const express = require('express');
const router = express.Router();

router.use(Authenticate);
router.post('/', sessionValidator.ValidateCreateSession, gameSessionController.createGameSession);
router.get('/', gameSessionController.getAllPublicGameSessions);
router.get('/:sessionId', gameSessionController.getGameSessionById);
router.put('/:sessionId', gameSessionController.updateGameSession);
router.post('/:sessionCode/join', gameSessionController.joinGameSession);
router.post('/:sessionId/leave', gameSessionController.leaveGameSession);
router.post('/:sessionId/question', sessionValidator.ValidateQuestion, gameSessionController.addQuestionToSession);
router.post('/:sessionId/start', sessionValidator.ValidateStartSession, gameSessionController.startGameSession);
router.post('/:sessionId/attempt', sessionValidator.ValidateAttempt, gameSessionController.attemptQuestionInSession);
router.post('/:sessionId/end', sessionValidator.ValidateEndSession, gameSessionController.endGameSession)

module.exports = router;

// Validate
