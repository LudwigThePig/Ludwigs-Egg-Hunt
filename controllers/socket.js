const connection = (server) => {
  const io = require('socket.io').listen(server);

  
  io.on('connection', (socket) => {
    
    console.log('A user connected!')
    connectPlayer(socket);
    console.log(players)
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
      disconnectPlayer(socket);
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
    team: (Math.floor(Math.random() * 2) === 0) ? 'red' : 'blue'
  }

  players[id] = playerObj;
  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', players[id])
}

const disconnectPlayer = (socket) => {
  const { id } = socket;
  delete players[id]
  io.emit('disconnect', id);
}


module.exports = connection;