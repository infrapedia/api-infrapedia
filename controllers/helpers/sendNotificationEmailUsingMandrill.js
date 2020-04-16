// eslint-disable-next-line camelcase
function sendNotificationEmailUsingMandrill(emailReceive, subject, html, replyToEmail) {
  return new Promise((resolve, reject) => {
    try {
      const Mandrill = require('node-mandrill')(process.env.MANDRILLAPIKEY);
      const email = (emailReceive === '') ? process.env.EMAILNOTIFICATIONS : emailReceive;
      Mandrill('/messages/send', {
        message: {
          to: [{ email }],//(email !== '') ? [] : [{ email }],
          // 'Reply-To': (replyToEmail) || '',
          from_email: process.env.MANDRILL_EMAIL,
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
