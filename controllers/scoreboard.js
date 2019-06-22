const Pig = require('../models/Pig.js');

const getPigs = () => {
  return Pig.find({}, null, {sort: {score: -1},limit: 10}, (err, pigs) => {
      if (err) {
        return console.error(err);
      }
      return pigs;
    });
}

const newPig = (pig) => {
  return Pig.find({_id: pig._id,}, (err, doc) => {
    if (err) {
      return console.error(err);
    }
    if (doc.length > 0) {
      return console.log('duplicate pigss', doc);
    } 
    let newPig = new Pig(pig);
    return newPig.save()
      .then(res => res); 
  })
}

const putPig = (pig) => {
  return Pig.findOneAndUpdate({_id: pig._id}, {score: pig.score}, (err) => {
    if (err) {
      return console.error(err);
    }
    return;
  })
}

module.exports = {
  getPigs: getPigs,
  newPig: newPig,
  putPig: putPig
}