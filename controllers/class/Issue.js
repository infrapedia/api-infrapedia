const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Issue {
  constructor() {
    this.model = require('../../models/issues.model');
  }

  addReport(user, data) {
    console.log('--- LLego hasta aqui ---');
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((issues) => {
            const issue = {
              uuid: String(user),
              t: data.t,
              email: (data.email),
              phone: (data.phone),
              issue: (data.issue),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              disabled: false,
              viewed: false,
            };
            if (ObjectID.isValid(data.elemnt)) { issue.elemnt_id = new ObjectID(data.elemnt); } else { issue.elemnt = data.elemnt; }
            issues.insertOne(issue, (err, I) => {
              if (err) reject({ m: err });
              resolve({ m: 'Thank you, your issue was registered in our system' });
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  // ownerList(user) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       if (user !== undefined || user !== '') {
  //         /*
  //          * Debemos buscar segun la lista del propietario, cuales son los
  //          * cables, CableLandingStation, Facilities, Ixps que tienen problemas
  //          */
  //       } else { resolve('Not user found'); }
  //     } catch (e) { reject({ m: e }); }
  //   });
  // }

  Cables() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cables) => {
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  CableLandingStations(user, page) {
    return new Promise((resolve, reject) => {
      try {
        console.log(page);
        this.model = require('../../models/cls.model');
        this.model().then((cls) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          console.log(limit, page);
          console.log(((limit * page) - limit));
          console.log(JSON.stringify([
            { $match: { uuid: String(user) } },
            { $sort: { uDate: -1 } },
            {
              $lookup: {
                from: 'issues',
                localField: '_id',
                foreignField: 'elemnt_id',
                as: 'elemnt_id',
              },
            },
            { $unwind: { path: '$elemnt_id', preserveNullAndEmptyArrays: false } },
            { $addFields: { rgDate: '$elemnt_id.rgDate', uDate: '$elemnt_id.rgDate' } },
            {
              $project: {
                uuid: 0,
                geom: 0,
                cables: 0,
                size: 0,
                elemnt_id: 0,
              },
            },
            { $skip: Math.abs((limit * page) - limit) },
            { $limit: limit },
          ]));
          cls.aggregate([
            { $match: { uuid: String(user) } },
            { $sort: { uDate: -1 } },
            {
              $lookup: {
                from: 'issues',
                localField: '_id',
                foreignField: 'elemnt_id',
                as: 'elemnt_id',
              },
            },
            { $unwind: { path: '$elemnt_id', preserveNullAndEmptyArrays: false } },
            {
              $addFields: {
                rgDate: '$elemnt_id.rgDate', uDate: '$elemnt_id.rgDate', viewed: '$elemnt_id.viewed', idReport: '$elemnt_id._id',
              },
            },
            {
              $project: {
                uuid: 0,
                geom: 0,
                cables: 0,
                size: 0,
                elemnt_id: 0,
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

  Networks() {
  }

  Organization() {
  }

  reports(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          Promise.all([this.CableLandingStations(user, page)]).then((r) => {
            resolve({ m: 'loaded', r });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Issue;
