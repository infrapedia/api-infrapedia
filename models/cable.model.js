const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('cls',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['uuid'],
            properties: {
              uuid: { bsonType: 'string' },
              name: { bsonType: 'string' },
              system_lenght: { bsonType: 'double' },
              activationDateTime: { bsonType: 'date' }, // Convert to timestamp
              urls: { bsonType: 'array' },
              terrestrial: { bsonType: 'bool' },
              capacity_tbps: { bsonType: 'double' },
              fiberPairs: { bsonType: 'string' },
              notes: { bsonType: 'string' },
              facilities: { bsonType: 'array' }, // Array of object ID's
              cls: { bsonType: 'array' }, // Array of object ID's
              geometry: { bsonType: 'object' },
              rgDate: { bsonType: 'date' },
              uDate: { bsonType: 'date ' },
              status: { bsonType: 'bool' },
              deleted: { bsonType: 'bool' },
            },
          },
        },
      }).then((network) => { resolve(network); }).catch((err) => {
      reject(err);
    });
  });
};
