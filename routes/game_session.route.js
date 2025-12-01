const gameSessionController = require('../controllers/game_session.controller');
const {createGameSessionValidator, updateGameSessionValidator} = require('../validators/game_session.validator');
const express = require('express');
const router = express.Router();

router.post('/', createGameSessionValidator, gameSessionController.createGameSession);
router.get('/', gameSessionController.getAllGameSessions);
router.get('/:sessionId', gameSessionController.getGameSessionById);
router.put('/:sessionId', updateGameSessionValidator, gameSessionController.updateGameSession);
router.put('/:sessionId/join', gameSessionController.joinGameSession);
router.put('/:sessionId/leave', gameSessionController.leaveGameSession);
router.put('/:sessionId/question', gameSessionController.addQuestionToSession);
router.put('/:sessionId/start', gameSessionController.startGameSession);
router.put('/:sessionId/attempt', gameSessionController.attemptQuestionInSession);
router.delete('/:sessionId', gameSessionController.deleteGameSession);

module.exports = router;
