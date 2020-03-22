const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('cls'
      // {
      //   validator: {
      //     $jsonSchema: {
      //       bsonType: 'object',
      //       required: ['uuid'],
      //       properties: {
      //         uuid: { bsonType: 'string' },
      //         name: { bsonType: 'string' },
      //         state: { bsonType: 'string' },
      //         slug: { bsonType: 'string' },
      //         geom: { bsonType: 'object' },
      //         cables: { bsonType: ['array'] }, // Array of object ID's
      //         rgDate: { bsonType: 'date' },
      //         uDate: { bsonType: 'date' },
      //         status: { bsonType: 'bool' },
      //         deleted: { bsonType: 'bool' },
      //       },
      //     },
      //     validationLevel: 'off',
      //     validationAction: 'warn',
      //   },
      // }
      ).then((network) => { resolve(network); }).catch((err) => {
      reject(err);
    });
  });
};
