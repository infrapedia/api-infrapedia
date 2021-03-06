// const querystring = require('querystring');
const util = require('util');
const url = require('url');
const Axios = require('axios');
const luxon = require('luxon');

class User {
  constructor() {
    this.auth0Url = new url.URL(util.format('https://%s/api/v2', process.env.AUTH0_DOMAIN));
  }

  getProfile(token, user) {
    return new Promise((resolve, reject) => {
      try {
        const config = { headers: { Authorization: `bearer ${token}` } };
        Axios.get(`${this.auth0Url}/users/${user}?include_fields=true`,
          // bodyParameters,
          config)
          .then((response) => { resolve(response.data); }).catch((error) => { reject(error); });
      } catch (e) { reject(e); }
    });
  }

  updateProfileMetadata(token, user, metadata) {
    return new Promise((resolve, reject) => {
      try {
        const config = { headers: { Authorization: `bearer ${token}` } };
        Axios.patch(`${this.auth0Url}/users/${user}`, { user_metadata: metadata }, config).then((response) => { resolve(response.data); }).catch((error) => { reject(error); });
      } catch (e) { reject(e); }
    });
  }

  updatePhoneNumber(token, user, data) {
    return new Promise((resolve, reject) => {
      try {
        const config = { headers: { Authorization: `bearer ${token}` } };
        Axios.patch(`${this.auth0Url}/users/${user}`, { phone_number: data.phone_number }, config).then((response) => { resolve(response.data); }).catch((error) => { reject(error); });
      } catch (e) { reject(e); }
    });
  }

  updateName(token, user, data) {
    return new Promise((resolve, reject) => {
      try {
        const config = { headers: { Authorization: `bearer ${token}` } };
        Axios.patch(`${this.auth0Url}/users/${user}`, { name: data.name, family_name: data.family_name }, config).then((response) => { resolve(response.data); }).catch((error) => { reject(error); });
      } catch (e) { reject(e); }
    });
  }

  logs(user) {
    return new Promise((resolve, reject) => {
      try {
        const LOG = require('../../models/statistic.model');
        LOG().then((LOG) => {
          LOG.aggregate([
            { $sort: { rgDate: -1 } },
            {
              $match: {
                uuid: user,
              },
            },
            {
              $project: {
                path: 1,
                rgDate: 1,
              },
            },
            { $limit: 10 },
          ]).toArray((err, r) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r });
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject(e); }
    });
  }
  verifyElement(user, email, element, t) {
    return new Promise((resolve, reject) => {
      try {
        const verifications = require('../../models/verification.model');
        verifications().then((verifications) => {
          verifications.insertOne({
            uuid: user,
            email,
            element,
            t,
            rgDate: luxon.DateTime.utc(),
          }, (err, i) => {
            if (err) reject({ m: err });
            resolve({ m: 'Thank you, your message was registered in our system' });
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject(e); }
    });
  }
}

module.exports = User;
