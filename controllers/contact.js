const ejs = require('ejs');
const sendEmail = require('./helpers/sendNotificationEmailUsingSendgrid');

module.exports = function contact(email, data) {
  return new Promise((resolve, reject) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      ejs.renderFile('templates/infrapedia/email_contact.ejs', {
        subject: 'Someone has sent a message on Infrapedia/contact',
        email: data.email,
        message: `From: ${data.first_name} ${data.last_name} <br /><hr/> ${data.message} <br /><br /> <strong>${data.company}</strong>`,
      }, (err, html) => {
        // When we want to include the email of user we can use r.email
        sendEmail('', `Someone has sent a message on Infrapedia/contact - ${new Date().getDate()}/${new Date().getMonth() + 1}`, html, process.env.EMAILNOTIFICATIONS);
        resolve({ m: 'The message has been sent correctly' });
      });
      // const sendTicket = require('./helpers/freshdesk');
      // sendTicket(
      //   {
      //     name: `${data.first_name} ${data.last_name}`,
      //     email: data.email,
      //     subject: 'A new contact message',
      //     description: `From: ${data.first_name} ${data.last_name} <br /><hr/> ${data.message} <br /><br /> <strong>${data.company}</strong>`,
      //     status: 2,
      //     priority: 2,
      //   },
      // ).then(() => {
      //   resolve({ m: 'The message has been sent correctly' });
      // }).catch((err) => {
      //   reject({ m: `We had a problem sending the message, please resend it, ${err}` });
      // });
    } else {
      reject({ m: 'This an invalid email' });
    }
  });
};
