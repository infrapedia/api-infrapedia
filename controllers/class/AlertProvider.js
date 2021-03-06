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

  sendEmail(user, params) {
    return new Promise((resolve, reject) => {
      try {
        const provider = require('../../models/alertsProviders.model');
        // we need to search the provider configured
        provider().then((provider) => {
          provider.findOne({
            uuid: user,
          }, (err, options) => {
            if (err) reject({ m: err });
            const ejs = require('ejs');
            switch (options.provider) {
              case 'mandrill':
                const mandrill = require('../helpers/mandrill');
                // eslint-disable-next-line no-unused-vars
                ejs.renderFile('templates/infrapedia/email_alerts_one.ejs', params, (err, html) => {
                  mandrill(params.idElement, params.subject, html, options.options.apiKey, options.options.from).then((r) => {
                    resolve(r);
                  }).catch((e) => {
                    reject(e);
                  });
                });
                break;
              case 'smtp':
                break;
              default:
                reject({ m: 'provider not selected' });
            }
          });
        }).catch((e) => reject({ m: e + 1 }));
      } catch (e) {
        reject({ m: e + 2 });
      }
    });
  }
}
module.exports = AlertProvider;
