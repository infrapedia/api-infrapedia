const db = require('../config/connection.js');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('search',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['uuid'],
            properties: {
              uuid: { bsonType: 'string' },
              search: { bsonType: 'string' },
              rgDate: { bsonType: 'date' },
            },
          },
        },
        validationLevel: 'off',
        validationAction: 'warn',
      }).then((organization) => { resolve(organization); }).catch((err) => {
      reject(err);
    });
  });
};
