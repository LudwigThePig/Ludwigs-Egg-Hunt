const Pig = require('../models/Pig.js');

module.exports = () => {
  this.getScores = () => {
    return Pig.find({}, ['name', 'score'], {sort: {score: -1}}, (err, pigs) => {
      if (err) {
        return console.error(err);
      }
      return pigs;
    })
  }

  this.putScore = (pig) => {
    Pig.findById(pig.id, {name: pig.name, score: pig.score}, (err) => {
      if (err) {
        return console.error(err);
      }
      return;
    })
  }
}