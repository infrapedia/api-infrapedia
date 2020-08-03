const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('alerts').then((network) => { resolve(network); }).catch((err) => {
      resolve(db.get().collection('alerts'));
    });
  });
};
