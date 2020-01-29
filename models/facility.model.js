const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('facilities',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['uuid '],
            properties: {
              uuid: { bsonType: 'string' },
              fac_id: { bsonType: 'string' },
              name: { bsonType: 'string' },
              point: { bsonType: 'object' },
              address: {
                bsonType: ['array'],
                items: {
                  properties: {
                    _id: {
                      bsonType: 'objectId',
                    },
                    address: { bsonType: 'string' },
                    point: { bsonType: 'object' },
                  },
                },
              },
              websites: { bsonType: ['array'] }, // Array of strings
              polygon: { },
              rgDate: { bsonType: 'date' },
              uDate: { bsonType: 'date' },
              status: { bsonType: 'bool' },
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
