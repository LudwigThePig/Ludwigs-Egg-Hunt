require('dotenv').config();
const path = require('path');
const express = require('express');
const socket = require('./controllers/socket.js');
const mongoose = require('mongoose');
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT;


app.use(express.static(path.resolve(__dirname, 'dist')));

mongoose.connect(process.env.MONGO_CON, {useNewUrlParser: true}, (err)=>{
  if (err){
    console.log(`Ooops, looks like something went wrong: ${err}`);
  } else { 
    console.log(`You are now connected to the database!`)
  }
});

server.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Connected on port ${port}`)
})

socket(server);