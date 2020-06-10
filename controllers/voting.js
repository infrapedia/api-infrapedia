const { ObjectID } = require('mongodb');
const luxon = require('luxon');
const voting = require('../models/voting.model');

module.exports = {
  setVote: (data, user) => new Promise((resolve, reject) => {
    try {
      voting().then((voting) => {
        voting.findOneAndUpdate({ uuid: user }, {
          $setOnInsert: {
            uuid: user,
            vote: JSON.parse(data.votes),
            rgDate: luxon.DateTime.utc(),
          },
        },
        {
          returnOriginal: false,
          upsert: true,
        }, (err, r) => {
          if (err) reject({ m: err });
          resolve({ m: 'Your vote was registered correctly' });
        });
      }).catch((e) => { });
    } catch (e) { reject({ m: e }); }
  }),
  getVote: (user) => new Promise((resolve, reject) => {
    try {
      voting().then((voting) => {
        voting.find({ uuid: user }).count((err, q) => {
          if (err) { reject({ m: 'Problem detected' }); } else if (q > 0) {
            reject({ m: 'You have a previously registered vote' });
          } else {
            resolve({ m: 'You can vote' });
          }
        });
      }).catch((e) => {});
    } catch (e) { reject({ m: e }); }
  }),
};
