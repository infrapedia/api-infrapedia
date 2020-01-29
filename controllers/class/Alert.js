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

  Disabled(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((alerts) => {
            alerts.findOneAndUpdate({
              uuid: String(user),
              t: data.t,
              elemnt: String(data.elemnt),
            }, { $set: { disabled: true } }, (err, u) => {
              if (err) reject({ m: err });
              resolve({ m: 'The notification was successfully disabled, re-enable it at any time' });
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }


  cables(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((alert) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          alert.aggregate([{
            $match: {
              $and: [{ uuid: user }, { t: '1' }],
            },
          },
          {
            $lookup: {
              from: 'cables',
              let: { elemnt: '$elemnt' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: [{ $toString: '$_id' }, '$$elemnt'] }] } } },
              ],
              as: 'elemnt_id',
            },
          },
          {
            $project: {
              _idElement: { $arrayElemAt: ['$elemnt_id._id', 0] },
              name: { $arrayElemAt: ['$elemnt_id.name', 0] },
              status: { $arrayElemAt: ['$elemnt_id.status', 0] },
              t: 'cable',
              disabled: 1,
            },
          }]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  cls(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((alert) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          alert.aggregate([{
            $match: {
              $and: [{ uuid: user }, { t: '2' }],
            },
          },
          {
            $lookup: {
              from: 'cls',
              let: { elemnt: '$elemnt' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: [{ $toString: '$_id' }, '$$elemnt'] }] } } },
              ],
              as: 'elemnt_id',
            },
          },
          {
            $project: {
              _idElement: { $arrayElemAt: ['$elemnt_id._id', 0] },
              name: { $arrayElemAt: ['$elemnt_id.name', 0] },
              status: { $arrayElemAt: ['$elemnt_id.status', 0] },
              t: 'cls',
              disabled: 1,
            },
          }]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  facilities(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((alert) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          alert.aggregate([{
            $match: {
              $and: [{ uuid: user }, { t: '3' }],
            },
          },
          {
            $lookup: {
              from: 'facilities',
              let: { elemnt: '$elemnt' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: [{ $toString: '$_id' }, '$$elemnt'] }] } } },
              ],
              as: 'elemnt_id',
            },
          },
          {
            $project: {
              _idElement: { $arrayElemAt: ['$elemnt_id._id', 0] },
              name: { $arrayElemAt: ['$elemnt_id.name', 0] },
              status: { $arrayElemAt: ['$elemnt_id.status', 0] },
              t: 'facility',
              disabled: 1,
            },
          }]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  ixps(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((alert) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          alert.aggregate([{
            $match: {
              $and: [{ uuid: user }, { t: '4' }],
            },
          },
          {
            $lookup: {
              from: 'ixps',
              let: { elemnt: '$elemnt' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: [{ $toString: '$_id' }, '$$elemnt'] }] } } },
              ],
              as: 'elemnt_id',
            },
          },
          {
            $project: {
              _idElement: { $arrayElemAt: ['$elemnt_id._id', 0] },
              name: { $arrayElemAt: ['$elemnt_id.name', 0] },
              status: { $arrayElemAt: ['$elemnt_id.status', 0] },
              t: 'ixp',
              disabled: 1,
            },
          }]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  networks(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((alert) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          alert.aggregate([{
            $match: {
              $and: [{ uuid: user }, { t: '6' }],
            },
          },
          {
            $lookup: {
              from: 'networks',
              let: { elemnt: '$elemnt' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: [{ $toString: '$_id' }, '$$elemnt'] }] } } },
              ],
              as: 'elemnt_id',
            },
          },
          {
            $project: {
              _idElement: { $arrayElemAt: ['$elemnt_id._id', 0] },
              name: { $arrayElemAt: ['$elemnt_id.name', 0] },
              status: { $arrayElemAt: ['$elemnt_id.status', 0] },
              t: 'network',
              disabled: 1,
            },
          }]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  orgs(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((alert) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          alert.aggregate([{
            $match: {
              $and: [{ uuid: user }, { t: '7' }],
            },
          },
          {
            $lookup: {
              from: 'organizations',
              let: { elemnt: '$elemnt' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: [{ $toString: '$_id' }, '$$elemnt'] }] } } },
              ],
              as: 'elemnt_id',
            },
          },
          {
            $project: {
              _idElement: { $arrayElemAt: ['$elemnt_id._id', 0] },
              name: { $arrayElemAt: ['$elemnt_id.name', 0] },
              status: { $arrayElemAt: ['$elemnt_id.status', 0] },
              t: 'org',
              disabled: 1,
            },
          }]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  configuredAlerts(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          Promise.all([this.cables(user, page), this.cls(user, page), this.networks(user, page), this.orgs(user, page)]).then(async (notifications) => {
            resolve(await notifications.reduce((total, value) => total.concat(value), []));
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Alert;
