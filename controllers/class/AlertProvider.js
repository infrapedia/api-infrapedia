const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class AlertProvider {
  constructor() {
    this.model = require('../../models/alertsProviders.model');
  }

  configProviderEmail(user, config) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((provider) => {
          provider.findOne({ uuid: user, t: 'email' }, (err, p) => {
            if (err) reject({ m: err });
            else if (p) {
              provider.updateOne({ _id: p._id, uuid: user },
                { $set: { provider: config.provider, options: JSON.parse(config.options), uDate: luxon.DateTime.utc() } }, (err, u) => {
                  if (err) reject({ m: err });
                  resolve({ m: 'Provider configured' });
                });
            } else {
              provider.insertOne({
                uuid: user,
                t: 'email',
                provider: config.provider,
                options: JSON.parse(config.options),
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
              }, (err, i) => {
                if (err) reject({ m: err });
                resolve({ m: 'Provider configured' });
              });
            }
          });
        }).catch((e) => reject({ m: e + 1 }));
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  getEmailProvider(user) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((provider) => {
          provider.aggregate([{ $match: { uuid: user, t: 'email' } }, {
            $project: {
              _id: 0, uuid: 0, rgDate: 0, uDate: 0,
            },
          }]).toArray((err, p) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loadedd', r: p });
          });
        });
      } catch (e) {
        reject({ m: e + 2 });
      }
    });
  }
}
module.exports = AlertProvider;
