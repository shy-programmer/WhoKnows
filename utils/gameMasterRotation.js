const playerModel = require('../models/player.model')
const gameSessionModel = require('../models/game_session.model')

const changeGameMaster = async (session) => {
    const sessionId = session._id
const activePlayers = await playerModel
    .find({ sessionId, inGame: true })
    .sort({ createdAt: 1 }); 

if (activePlayers.length >= 1) {
    const currentIndex = activePlayers.findIndex(
        p => p.userId.toString() === session.gameMasterID.toString()
    );

    const nextIndex = (currentIndex + 1) % activePlayers.length;

        await gameSessionModel.findByIdAndUpdate(sessionId, {
        gameMasterID: activePlayers[nextIndex].userId
    });

}
}

module.exports = {
    changeGameMaster
}
