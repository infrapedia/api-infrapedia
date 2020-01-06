const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Issue {
  constructor() {
    this.model = require('../../models/issues.model');
  }

  addReport(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((issues) => {
            let issue = {
              uuid: String(user),
              t: data.t,
              email: (data.email),
              phone: (data.phone),
              issue: (data.issue),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              disabled: false,
            };
            if (ObjectID.isValid(data.elemnt)) { issue.elemnt_id = new ObjectID(data.elemnt); }
            else { issue.elemnt = data.elemnt; }
            issues.insertOne(issue, (err, I) => {
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

  _Cables(){
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cables) => {
        });
      }catch (e) { reject({ m: e }); }
    });
  }
  _CableLandingStations(){
    try {
      this.model().then((cls) => {
      });
    }catch (e) { reject({ m: e }); }
  }
  _Facilities(){
    try {
    }catch (e) { reject({ m: e }); }
  }
  _Networks(){
  }
  _Organization(){
  }

  myReports(user, search) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {

        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Issue;
