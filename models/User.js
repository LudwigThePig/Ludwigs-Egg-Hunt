const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PigSchema = new Schema({
  _id: String,
  name: String,
  score: Number
});

const Pig = mongoose.model('Pig', PigSchema);

module.exports = Pig;