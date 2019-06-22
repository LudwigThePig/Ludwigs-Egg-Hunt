require('dotenv').config();
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT;


app.use(express.static(path.resolve(__dirname, 'dist')));

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Connected on port ${port}`)
})