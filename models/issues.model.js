const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('issues').then((issues) => { resolve(issues); }).catch((err) => {
      resolve(db.get().collection('issues'));
    });
  });
};
