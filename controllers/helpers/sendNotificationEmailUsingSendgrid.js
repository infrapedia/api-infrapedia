const sgMail = require('@sendgrid/mail');

function sendNotificationEmailUsingMandrill(emailReceive, subject, html, replyToEmail) {
  return new Promise((resolve, reject) => {
    try {
      const email = (emailReceive === '' || emailReceive === undefined) ? process.env.EMAILNOTIFICATIONS : emailReceive;
      sgMail.setApiKey(process.env.APIKEYSENDGRID)
      const msg = {
        to: email,
        // cc: (emailReceive !== '') ? process.env.EMAILNOTIFICATIONS : '',
        from: process.env.EMAILSENDER,
        subject,
        html,
      };
      sgMail.send(msg).then(() => resolve(), (error) => {
        if (error.response) {
          console.error(error.response.body);
        }
        reject();
      });
    } catch (e) { reject({ m: e }); }
  });
}
module.exports = sendNotificationEmailUsingMandrill;
