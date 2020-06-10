const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('voting').then((network) => { resolve(network); }).catch((err) => {
      reject(err);
    });
  });
};
