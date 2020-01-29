const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('networks',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['uuid'],
            properties: {
              uuid: { bsonType: 'string' },
              name: { bsonType: 'string' },
              websites: { bsonType: ['array'] }, // Array of strings
              organizations: { bsonType: ['array'] },
              facilities: { bsonType: ['array'] }, // Array of object IDs
              ixps: { bsonType: ['array'] }, // Array of object ID's
              cls: { bsonType: ['array'] }, // Array of object ID's
              cables: { bsonType: ['array'] }, // Array of object ID's
              rgDate: { bsonType: 'date' },
              uDate: { bsonType: 'date' },
              status: { bsonType: 'bool' },
              deleted: { bsonType: 'bool' },
            },
          },
          validationLevel: 'off',
          validationAction: 'warn',
        },
      }).then((network) => { resolve(network); }).catch((err) => {
      reject(err);
    });
  });
};
