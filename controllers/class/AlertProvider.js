const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class AlertProvider {
  constructor() {
    this.model = require('../../models/alertsProviders.model');
  }

  configProvider(user, config) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((provider) => {
          provider.findOne({ uuid: user }, (err, p) => {
            if (err) reject({ m: err });
            else if (p) {
              console.log(config.options)
              provider.updateOne({ _id: p._id, uuid: user },
                { $set: { provider: config.provider, options: JSON.parse(config.options), uDate: luxon.DateTime.utc() } }, (err, u) => {
                  if (err) reject({ m: err });
                  resolve({ m: 'Provider configured' });
                });
            } else {
              provider.insertOne({
                uuid: user,
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
}
module.exports = AlertProvider;
