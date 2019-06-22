const Pig = require('../models/Pig.js');

module.exports = function scoreboard () {
  this.getScores = () => {
    return Pig.find({}, ['name', 'score'], {sort: {score: -1}}, (err, pigs) => {
      if (err) {
        return console.error(err);
      }
      return pigs;
    })
  }

  this.newPig = (pig) => {
    Pig.find({_id: pig._id,}, (err, doc) => {
      if (err) {
        return console.error(err);
      }
      if (doc.length > 0) {
        return console.log('duplicate pigss', doc);
      } 
      let newPig = new Pig(pig);
      newPig.save()
        .then(res => console.log(res)) 
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