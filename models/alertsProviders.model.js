const db = require('../config/connection');

module.exports = function () {
  return new Promise((resolve, reject) => {
    db.get().createCollection('alertsProviders',
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['uuid'],
            properties: {
              uuid: { bsonType: 'string' },
              t: { bsonType: 'string' },
              provider: { bsonType: 'string' }, //Smt, Mandrill, Sendgrid, Mailgun
              options: { bsonType: 'object' },
              rgDate: { bsonType: 'date' },
              uDate: { bsonType: 'date' },
            },
          },
          validationLevel: 'off',
          validationAction: 'warn',
        },
      }).then((network) => { resolve(network); }).catch((err) => {
      resolve(db.get().collection('alertsProviders'));
    });
  });
};
