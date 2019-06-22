require('dotenv').config();
const path = require('path');
const express = require('express');
const socket = require('./controllers/socket.js');

const app = express();
const server = require('http').Server(app);
const port = process.env.PORT;


app.use(express.static(path.resolve(__dirname, 'dist')));

server.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Connected on port ${port}`)
})

socket(server);