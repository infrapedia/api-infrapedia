// eslint-disable-next-line camelcase
function sendEmailUsingMandrill(idElement, subject, html, api, from_email) {
  return new Promise((resolve, reject) => {
    try {
      const Mandrill = require('node-mandrill')(api);
      const alerts = require('../../models/alerts.model');
      alerts().then((alert) => {
        alert.aggregate([
          { $match: { elemnt: idElement } },
          { $project: { email: 1 } },
        ]).toArray((err, emails) => {
          if (err) reject(err);
          Mandrill('/messages/send', {
            message: {
              to: emails,
              from_email,
              subject,
              html,
            },
          }, (err, response) => {
            if (err) reject({ m: err });
            resolve({ m: response });
          });
        });
      }).catch((e) => {
        reject({ m: e });
      });
    } catch (e) { reject({ m: e }); }
  });
}
module.exports = sendEmailUsingMandrill;
