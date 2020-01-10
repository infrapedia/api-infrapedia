const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Alert {
  constructor() {
    this.model = require('../../models/alerts.model');
  }

  Add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((alerts) => {
            alerts.find({
              uuid: (user),
              t: data.t,
              elemnt: data.elemnt,
            }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c > 0) {
                alerts.updateOne({
                  uuid: String(user),
                  t: data.t,
                  elemnt: (data.elemnt),
                }, { $set: { disabled: false } }, (err, u) => {
                  if (err) reject({ m: err });
                  resolve({ m: 'Thank you, you have subscribed to the notifications, when there is any modification we will contact you' });
                });
              } else {
                alerts.insertOne({
                  uuid: String(user),
                  t: data.t,
                  elemnt: (data.elemnt),
                  email: (data.email),
                  phone: (data.phone),
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  disabled: false,
                }, (err, A) => {
                  if (err) reject({ m: err });
                  resolve({ m: 'Thank you, you have subscribed to the notifications, when there is any modification we will contact you' });
                });
              }
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  Disabled(user, data){
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((alerts) => {
            alerts.findOneAndUpdate({
              uuid: String(user),
              t: data.t,
              elemnt: String(data.elemnt),
            }, { $set: { disabled: true }}, (err, u) => {
              if (err) reject({ m: err });
              resolve({ m: 'The notification was successfully disabled, re-enable it at any time' });
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }


  cables(id){

  }
  cls(id){

  }
  orgs(id){

  }
  facilities(id){

  }
  network(id){

  }

  configuredAlerts(user, data){
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((alerts) => {

          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Alert;
