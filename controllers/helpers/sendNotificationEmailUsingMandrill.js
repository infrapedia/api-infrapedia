// eslint-disable-next-line camelcase
function sendNotificationEmailUsingMandrill(email, subject, html, replyToEmail) {
  return new Promise((resolve, reject) => {
    try {
      const Mandrill = require('node-mandrill')(process.env.MANDRILLAPIKEY);
      Mandrill('/messages/send', {
        message: {
          to: [ { email: process.env.EMAILNOTIFICATIONS } ],//(email !== '') ? [] : [{ email }],
          // 'Reply-To': (replyToEmail) || '',
          from_email: process.env.MANDRILL_EMAIL,
          subject,
          html,
        },
      }, (err, response) => {
        if (err) reject({ m: err });
        console.log(response, process.env.MANDRILLAPIKEY, process.env.EMAILNOTIFICATIONS, process.env.MANDRILL_EMAIL);
        resolve({ m: response });
      });
    } catch (e) { reject({ m: e }); }
  });
}
module.exports = sendNotificationEmailUsingMandrill;
