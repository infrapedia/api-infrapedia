module.exports = function contact(email, data) {
  return new Promise((resolve, reject) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      const sendTicket = require('./helpers/freshdesk');
      sendTicket(
        {
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          subject: 'A new contact message',
          description: `From: ${data.name} ${data.lastName} <br /><hr/> ${data.message} <br /><br /> <strong>${data.company}</strong>`,
          status: 2,
          priority: 2,
        },
      ).then(() => {
        resolve({ m: 'The message has been sent correctly' });
      }).catch((err) => {
        reject({ m: `We had a problem sending the message, please resend it, ${err}` });
      });
    } else {
      reject({ m: 'This an invalid email' });
    }
  });
};
