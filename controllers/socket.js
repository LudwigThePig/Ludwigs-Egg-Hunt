const connection = (server) => {
  const io = require('socket.io').listen(server);

  
  io.on('connection', (socket) => {
    console.log(`Pig ${socket.id} connected!`)
    connectPlayer(socket);

    socket.on('disconnect', () => {
      console.log(`Pig ${socket.id} disconnected!`); 
      const { id } = socket;
      delete players[id]
      io.emit('disconnect', id);
    });

    socket.on('playerMovement', (movementData) => {
      const { id } = socket;
      players[id].x = movementData.x;
      players[id].y = movementData.y;
      players[id].rotation = movementData.rotation;
      socket.broadcast.emit('playerMoved', players[id])
    });
    
  });
}

let players = {};

const connectPlayer = (socket) => {
  const id = socket.id;
  
  const playerObj = {
    rotation: 0, 
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: id,
    score: 0
  }

  players[id] = playerObj;
  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', players[id])
}

module.exports = connection;