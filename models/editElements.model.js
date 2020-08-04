const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('editElements').then((editElements) => { resolve(editElements); }).catch((err) => {
      resolve(db.get().collection('editElements'));
    });
  });
};
