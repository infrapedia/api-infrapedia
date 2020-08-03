const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('messages',
      //  ,
      // {
      //   validator: {
      //     $jsonSchema: {
      //       bsonType: 'object',
      //       required: ['uuid'],
      //       properties: {
      //         uuid: { bsonType: 'string' },
      //         t: { bsonType: 'string' }, // cables:1, CLS:2, Facilities:3, IXPS:4, Map:5, Network:6, Organization:7
      //         elemnt: { bsonType: 'string' },
      //         email: { bsonType: 'string' },
      //         phone: { bsonType: 'string' },
      //         issue: { bsonType: 'string' },
      //         rgDate: { bsonType: 'date' },
      //         uDate: { bsonType: 'date' },
      //         disabled: { bsonType: 'bool' },
      //         viewed: { bsonType: 'bool' },
      //         deleted: { bsonType: 'bool' },
      //       },
      //     },
      //     validationLevel: 'off',
      //     validationAction: 'warn',
      //   },
      // }
    ).then((network) => { resolve(network); }).catch((err) => {
      resolve(db.get().collection('messages'));
    });
  });
};
