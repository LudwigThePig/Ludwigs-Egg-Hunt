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
    
    socket.on('eggCollected', () => {
      // increment player's score
      const { id } = socket;

      if (scores.hasOwnProperty(id)) {
        scores[id]++;
      } else {
        scores[id] = 1;
      }
      // players[id].score++;
      console.log(scores[id])

      // ***MAKE DATABASE CALL HERE*** //


      // create new random egg position
      egg.x = Math.floor(Math.random() * canvas.x) + 50;
      egg.y = Math.floor(Math.random() * canvas.y) + 50;
      io.emit('eggLocation', egg);
      io.emit('scoreUpdate', scores)
    })

  });
}

const canvas = {
  x: 1300,
  y: 500
};

let players = {};

let egg = {
  x: Math.floor(Math.random() * canvas.x) + 50,
  y: Math.floor(Math.random() * canvas.y) + 50,
};


let scores = {};
// let scores = Object.keys(players).map( player => {
//   const { score} = players[player];
//   return { player: score}
// })

const connectPlayer = (socket) => {
  const id = socket.id;
  
  const playerObj = {
    rotation: 0, 
    x: Math.floor(Math.random() * canvas.x) + 50,
    y: Math.floor(Math.random() * canvas.y) + 50,
    playerId: id,
    score: 0
  }

  players[id] = playerObj;
  socket.emit('currentPlayers', players);
  socket.emit('eggLocation', egg)
  socket.broadcast.emit('newPlayer', players[id]);
}

module.exports = connection;