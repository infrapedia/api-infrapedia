const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('cls',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['uuid '],
            properties: {
              uuid: { bsonType: 'string' },
              name: { bsonType: 'string' },
              system_lenght: { bsonType: 'double' },
              activationDateTime: { bsonType: 'int' },
              urls: { bsonType: 'array' },
              terrestrial: { bsonType: 'bool' },
              capacity_tbps: { bsonType: 'double' },
              fiberPairs: { bsonType: 'string' },
              status: { bsonType: 'bool' },
              notes: { bsonType: 'string' },
              facilities: { bsonType: 'array' }, // Array of object ID's
              cls: { bsonType: 'array' }, // Array of object ID's
            },
          },
        },
      }).then((network) => { resolve(network); }).catch((err) => {
      reject(err);
    });
  });
};
