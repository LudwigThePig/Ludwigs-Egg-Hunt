const scoreboard = require('./scoreboard.js');

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
      const name = players[id].name;
      
      if (scores.hasOwnProperty(name)) {
        scores[name]++;
      } else {
        scores[name] = 1;
      }

      // emit new random egg position
      egg.x = Math.floor(Math.random() * canvas.x) + 50;
      egg.y = Math.floor(Math.random() * canvas.y) + 50;
      io.emit('eggLocation', egg);

      // Update Database, 
      // then get newest scoreboard, 
      // then broadcast newest scoreboard
      const putQuery = { _id: id, name: name, scores: scores[name] }
      // console.log(putQuery)
      scoreboard.putPig(putQuery)
        .then(() => scoreboard.getPigs())
        .then(latestScores => {
          scores = latestScores 
          io.emit('scoreUpdate', scores)
        });
    });

  });
}

const randomPigName = () => {
  const names = ['Chris P. Bacon', 'Piggie Smalls', 'Elvis Pigsley', 'Prince Hamlet', 'Ham Solo', 'Porkchop', 'Chewbacon', 'Big Belly Nelly', 'Kevin Bacon', 'Hogger', 'Harry Plopper', 'Sir Oinksalot']
  const randomInt = Math.floor(Math.random() * names.length);
  return names[randomInt];
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


let scores = [];

const connectPlayer = (socket) => {
  const id = socket.id;
  
  const playerObj = {
    rotation: 0,
    x: Math.floor(Math.random() * canvas.x) + 50,
    y: Math.floor(Math.random() * canvas.y) + 50,
    playerId: id,
    name: randomPigName(),
    score: 0
  }

  scoreboard.newPig({
    _id: playerObj.playerId,
    name: playerObj.name,
    score: 0
  })
    .then(() =>scoreboard.getPigs())
    .then(latestScores => scores = latestScores)

  players[id] = playerObj;
  socket.emit('currentPlayers', players);
  socket.emit('scoreUpdate', scores)
  socket.emit('eggLocation', egg)
  socket.broadcast.emit('newPlayer', players[id]);
}

module.exports = connection;