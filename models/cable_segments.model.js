const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('cables_segments').then((network) => { resolve(network); }).catch((err) => {
      resolve(db.get().collection('cables_segments'));
    });
  });
};
