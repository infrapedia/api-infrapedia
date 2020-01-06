const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Issue {
  constructor() {
    this.model = require('../../models/issues.model');
  }

  report(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((issues) => {
            issues.insertOne({
              uuid: String(user),
              t: data.t,
              elemnt: (data.elemnt),
              email: (data.email),
              phone: (data.phone),
              issue: (data.issue),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              disabled: false,
            }, (err, I) => {
              if (err) reject({ m: err });
              resolve({ m: 'Thank you, your issue was registered in our system' });
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  ownerList(user) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          /*
           * Debemos buscar segun la lista del propietario, cuales son los
           * cables, CableLandingStation, Facilities, Ixps que tienen problemas
           */
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  myReports(user) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {

        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Issue;
