const connection = (server) => {
  const io = require('socket.io').listen(server);
  io.on('connection', (socket) => {
    console.log('A user connected!')
    socket.on('disconnect', () => {
      console.log('user disconnected')
    });
  });
}

module.exports = connection;