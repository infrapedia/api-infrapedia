// eslint-disable-next-line camelcase
function sendNotificationEmailUsingMandrill(subject, html) {
  return new Promise((resolve, reject) => {
    try {
      const Mandrill = require('node-mandrill')(process.env.MANDRILLAPIKEY);
      Mandrill('/messages/send', {
        message: {
          to: JSON.parse(process.env.EMAILSNOTIFICATIONS),
          from: 'noreply@infrapedia.com',
          subject,
          html,
        },
      }, (err, response) => {
        if (err) reject({ m: err });
        resolve({ m: response });
      });
    } catch (e) { reject({ m: e }); }
  });
}
module.exports = sendNotificationEmailUsingMandrill;
