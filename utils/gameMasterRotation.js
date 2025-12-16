const playerModel = require('../models/player.model');

const changeGameMaster = async (session) => {
  const sessionId = session._id;

  const activePlayers = await playerModel
    .find({ sessionId, inGame: true })
    .sort({ createdAt: 1 });

  if (activePlayers.length === 0) return;

  if (activePlayers.length === 1) {
    session.gameMasterID = activePlayers[0].userId;
    return;
  }

  let currentIndex = activePlayers.findIndex(
    p => p.userId.toString() === session.gameMasterID.toString()
  );

  if (currentIndex === -1) {
    session.gameMasterID = activePlayers[0].userId;
  } else {
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    session.gameMasterID = activePlayers[nextIndex].userId;
  }
};

module.exports = { changeGameMaster };
