const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('maps',
      // {
      //   validator: {
      //     $jsonSchema: {
      //       bsonType: 'object',
      //       required: ['uuid '],
      //       properties: {
      //         uuid: { bsonType: 'string' },
      //         fac_id: { bsonType: 'string' },
      //         name: { bsonType: 'string' },
      //         point: { bsonType: 'object' },
      //         address: {
      //           bsonType: ['array'],
      //           items: {
      //             properties: {
      //               _id: {
      //                 bsonType: 'objectId',
      //               },
      //               address1: { bsonType: 'string' },
      //               address2: { bsonType: 'string' },
      //               city: { bsonType: 'string' },
      //               clli: { bsonType: 'string' },
      //               zipcode: { bsonType: 'string' },
      //               country: { bsonType: 'string' },
      //             },
      //           },
      //         },
      //         websites: { bsonType: ['array'] }, // Array of strings
      //         information: { bsonType: 'string' },
      //         polygon: { bsonType: 'object' },
      //         rgDate: { bsonType: 'date' },
      //         uDate: { bsonType: 'date' },
      //         status: { bsonType: 'bool' },
      //       },
      //     },
      //     validationLevel: 'off',
      //     validationAction: 'warn',
      //   },
      // }
    ).then((maps) => { resolve(maps); }).catch((err) => {
      reject(err);
    });
  });
};
