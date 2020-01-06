const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('issues',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['uuid'],
            properties: {
              uuid: { bsonType: 'string' },
              t: { bsonType: 'string' }, // cables:1, CLS:2, Facilities:3, IXPS:4, Map:5, Network:6, Organization:7
              elemnt_id: { bsonType: 'objectId' },
              element: { bsonType: 'string' },
              email: { bsonType: 'string' },
              phone: { bsonType: 'string' },
              issue: { bsonType: 'string' },
              rgDate: { bsonType: 'date' },
              uDate: { bsonType: 'date' },
              disabled: { bsonType: 'bool' },
            },
          },
        },
      }).then((network) => { resolve(network); }).catch((err) => {
      reject(err);
    });
  });
};
