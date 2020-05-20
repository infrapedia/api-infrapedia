const unirest = require('unirest');

module.exports = function newsletter(email, data) {
  return new Promise((resolve, reject) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      const apiKey = process.env.APIKEYSENDGRID;
      const URL = 'https://api.sendgrid.com/v3/marketing/contacts';
      const Request = unirest.put(URL);
      Request.headers({
        Authorization: `Bearer ${apiKey}`,
      }).type('json')
        .send({
          list_ids: [
            String(process.env.newsletterList),
          ],
          contacts: [
            {
              email,
              first_name: data.first_name,
              last_name: data.last_name,
            },
          ],
        })
        .end((response) => {
          if (response.status === 202) resolve({ m: 'You were added to our newsletter list' });
          else reject({ m: 'Please try again, we have an error' });
        });
    } else {
      reject({ m: 'This an invalid email' });
    }
  });
};
