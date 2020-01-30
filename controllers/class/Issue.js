const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Issue {
  constructor() {
    this.model = require('../../models/issues.model');
  }

  //TODO: issue reports filtered by deleted
  //TODO: validate the update

  addReport(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((issues) => {
            const issue = {
              uuid: String(user),
              t: data.t,
              elemnt: new ObjectID(data.elemnt),
              email: (data.email),
              phone: (data.phone),
              issue: (data.issue),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              disabled: false,
              viewed: false,
              deleted: false,
            }

            console.log(issue);
            issues.insertOne(issue, (err, I) => {
              if (err) reject({ m: err });
              resolve({ m: 'Thank you, your issue was registered in our system' });
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  Cables(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/cable.model');
        this.model().then((cable) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          cable.aggregate([
            { $match: { uuid: String(user) } },
            { $sort: { uDate: -1 } },
            {
              $lookup: {
                from: 'issues',
                localField: '_id',
                foreignField: 'elemnt',
                as: 'elemnt_id',
              },
            },
            { $unwind: { path: '$elemnt_id', preserveNullAndEmptyArrays: false } },
            {
              $addFields: {
                rgDate: '$elemnt_id.rgDate', uDate: '$elemnt_id.rgDate', viewed: '$elemnt_id.viewed', idReport: '$elemnt_id._id', elemntStatus: '$status',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                elemntStatus: 1,
                rgDate: 1,
                uDate: 1,
                status: 1,
                viewed: 1,
                idReport: 1,
                t: 'cable',
              },
            },
            { $skip: Math.abs((limit * page) - limit) },
            { $limit: limit },
          ]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  CableLandingStations(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/cls.model');
        this.model().then((cls) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          cls.aggregate([
            { $match: { uuid: String(user) } },
            { $sort: { uDate: -1 } },
            {
              $lookup: {
                from: 'issues',
                localField: '_id',
                foreignField: 'elemnt',
                as: 'elemnt_id',
              },
            },
            { $unwind: { path: '$elemnt_id', preserveNullAndEmptyArrays: false } },
            {
              $addFields: {
                rgDate: '$elemnt_id.rgDate', uDate: '$elemnt_id.rgDate', viewed: '$elemnt_id.viewed', idReport: '$elemnt_id._id', elemntStatus: '$status',

              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                elemntStatus: 1,
                rgDate: 1,
                uDate: 1,
                status: 1,
                viewed: 1,
                idReport: 1,
                t: 'cls',
              },
            },
            { $skip: Math.abs((limit * page) - limit) },
            { $limit: limit },
          ]).toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  Facilities() {
    try {
    } catch (e) { reject({ m: e }); }
  }

  Networks() {}

  Organization() {}

  myReportsCLS(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/issues.model');
        this.model().then((issues) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          issues.aggregate([
            { $match: { $and: [{ uuid: String(user) }, { t: '2' }] } },
            { $sort: { uDate: -1 } },
            { $skip: Math.abs((limit * page) - limit) },
            { $limit: limit },
            {
              $lookup: {
                from: 'cls',
                localField: 'elemnt',
                foreignField: '_id',
                as: 'elemnt_id',
              },
            },
            {
              $addFields: {
                elemnt_id: { $arrayElemAt: ['$elemnt_id', 0] },
              },
            },
            {
              $addFields: {
                _id: '$elemnt_id._id',
                name: '$elemnt_id.name',
                elemntStatus: '$elemnt_id.status',
                idReport: '$_id',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                elemntStatus: 1,
                rgDate: 1,
                uDate: 1,
                status: 1,
                viewed: 1,
                idReport: 1,
                t: 'cls',
              },
            },
          ]).toArray((err, r) => {
            console.log(err);
            resolve(r);
          });
        }).catch();
      } catch (e) { reject({ m: e }); }
    });
  }

  myReportsCables(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/issues.model');
        this.model().then((issues) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          issues.aggregate([
            { $match: { $and: [{ uuid: String(user) }, { t: '1' }] } },
            { $sort: { uDate: -1 } },
            { $skip: Math.abs((limit * page) - limit) },
            { $limit: limit },
            {
              $lookup: {
                from: 'cables',
                localField: 'elemnt',
                foreignField: '_id',
                as: 'elemnt_id',
              },
            },
            {
              $addFields: {
                elemnt_id: { $arrayElemAt: ['$elemnt_id', 0] },
              },
            },
            {
              $addFields: {
                _id: '$elemnt_id._id',
                name: '$elemnt_id.name',
                elemntStatus: '$elemnt_id.status',
                idReport: '$_id',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                elemntStatus: 1,
                rgDate: 1,
                uDate: 1,
                status: 1,
                viewed: 1,
                idReport: 1,
                t: 'cable',
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch();
      } catch (e) { reject({ m: e }); }
    });
  }

  reports(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          Promise.all([this.CableLandingStations(user, page), this.Cables(user, page)]).then(async (r) => {
            r = await r.reduce((total, value) => total.concat(value), []);
            resolve({ m: 'loaded', r });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  myReports(user, page) {
    return new Promise((resolve, reject) => {
      try {
        Promise.all([this.myReportsCLS(user, page), this.myReportsCables(user, page)]).then(async (r) => {
          r = await r.reduce((total, value) => total.concat(value), []);
          resolve({ m: 'loaded', r });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  viewReportCable(user, id) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/issues.model');
        this.model().then((issues) => {
          // , { uuid: String(user) }
          issues.aggregate([
            { $match: { $and: [{ _id: new ObjectID(id) }, { t: '1' }] } },
            {
              $lookup: {
                from: 'cables',
                localField: 'elemnt_id',
                foreignField: '_id',
                as: 'elemnt_id',
              },
            },
            {
              $addFields: {
                elemnt_id: { $arrayElemAt: ['$elemnt_id', 0] },
              },
            },
            {
              $addFields: {
                _id: '$elemnt_id._id',
                name: '$elemnt_id.name',
                elemntStatus: '$elemnt_id.status',
                idReport: '$_id',
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch();
      } catch (e) { reject({ m: e }); }
    });
  }

  viewReportCls(user, id) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/issues.model');
        this.model().then((issues) => {
          // , { uuid: String(user) }
          issues.aggregate([
            { $match: { $and: [{ _id: new ObjectID(id) }, { t: '2' }] } },
            {
              $lookup: {
                from: 'cls',
                localField: 'elemnt_id',
                foreignField: '_id',
                as: 'elemnt_id',
              },
            },
            {
              $addFields: {
                elemnt_id: { $arrayElemAt: ['$elemnt_id', 0] },
              },
            },
            {
              $addFields: {
                _id: '$elemnt_id._id',
                name: '$elemnt_id.name',
                elemntStatus: '$elemnt_id.status',
                idReport: '$_id',
              },
            },
          ]).toArray((err, r) => {
            issues.updateOne({ _id: new ObjectID(id) }, { $set: { viewed: true } }, (err, u) => {
              resolve(r);
            });
          });
        }).catch();
      } catch (e) { reject({ m: e }); }
    });
  }

  viewReport(user, id, elemnt) {
    return new Promise((resolve, reject) => {
      try {
        switch (elemnt) {
          case 'cable':
            this.viewReportCable(user, id).then((r) => { resolve({ m: 'loaded', r }); }).catch((e) => { reject({ m: e }); });
            break;
          case 'cls':
            this.viewReportCls(user, id).then((r) => { resolve({ m: 'loaded', r }); }).catch((e) => { reject({ m: e }); });
            break;
          default:
            reject({ m: 'Element not valid' });
        }
      } catch (e) { reject({ m: e }); }
    });
  }

  deleteMyReport(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((issue) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            issue.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your issue report' });
              else {
                issue.updateOne(
                  { _id: id, uuid: String(user) }, { $set: { deleted: true } }, (err, u) => {
                    if (err) reject({ m: err });
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your issue report' });
                    else resolve({ m: 'Deleted' });
                  },
                );
              }
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve({ m: 'Not user found' }); }
      } catch (e) { reject({ m: 'error2' }); }
    });
  }
}
module.exports = Issue;
