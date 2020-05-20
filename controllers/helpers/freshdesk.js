const unirest = require('unirest');

function sendTicket(fields) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.FD_APIKEY;
    const fdendpoint = process.env.FD_ENDPOINT;
    const PATH = '/api/v2/tickets';
    const URL = `https://${fdendpoint}.freshdesk.com${PATH}`;
    const Request = unirest.post(URL);
    Request.auth({
      user: apiKey,
      pass: 'X',
      sendImmediately: true,
    }).type('json')
      .send(fields)
      .end((response) => {
        console.log(response.status);
        if (response.status === 201) resolve(response);
        else reject(response);
      });
  });
}
module.exports = sendTicket;
