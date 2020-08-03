const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('verifications',
       //  ,
       // {
       //   validator: {
       //     $jsonSchema: {
       //       bsonType: 'object',
       //       required: ['uuid'],
       //       properties: {
       //         uuid: { bsonType: 'string' },
       //         originalUrl: { bsonType: 'string' },
       //         urlCode: { bsonType: 'string' },
       //         rgDate: { bsonType: 'date' },
       //       },
       //     },
       //     validationLevel: 'off',
       //     validationAction: 'warn',
       //   },
       // }
    ).then((network) => { resolve(network); }).catch((err) => {
      resolve(db.get().collection('verifications'));
    });
  });
};
