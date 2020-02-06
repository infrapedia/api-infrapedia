const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Message {
  constructor() {
    this.model = require('../../models/messages.model');
  }

  // TODO: issue reports filtered by deleted
  // TODO: validate the update

  add(user, data) {
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
              message: (data.message),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              disabled: false,
              viewed: false,
              deleted: false,
            };

            console.log(issue);
            issues.insertOne(issue, (err, I) => {
              if (err) reject({ m: err });
              resolve({ m: 'Thank you, your message was registered in our system' });
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
                from: 'messages',
                localField: '_id',
                foreignField: 'elemnt',
                as: 'elemnt_id',
              },
            },
            { $unwind: { path: '$elemnt_id', preserveNullAndEmptyArrays: false } },
            {
              $addFields: {
                rgDate: '$elemnt_id.rgDate',
                uDate: '$elemnt_id.rgDate',
                viewed: '$elemnt_id.viewed',
                idMessage: '$elemnt_id._id',
                deleted: '$elemnt_id.deleted',
                elemntStatus: '$status',
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
                idMessage: 1,
                deleted: 1,
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
                from: 'messages',
                localField: '_id',
                foreignField: 'elemnt',
                as: 'elemnt_id',
              },
            },
            { $unwind: { path: '$elemnt_id', preserveNullAndEmptyArrays: false } },
            {
              $addFields: {
                rgDate: '$elemnt_id.rgDate',
                uDate: '$elemnt_id.rgDate',
                viewed: '$elemnt_id.viewed',
                idMessage: '$elemnt_id._id',
                deleted: '$elemnt_id.deleted',
                elemntStatus: '$status',
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
                idMessage: 1,
                deleted: 1,
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

  myMessagesCLS(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/messages.model');
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
                idMessage: '$_id',
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
                idMessage: 1,
                deleted: 1,
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

  myMessagesCables(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/messages.model');
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
                idMessage: '$_id',
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
                idMessage: 1,
                deleted: 1,
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

  sents(user, page) {
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

  myMessages(user, page) {
    return new Promise((resolve, reject) => {
      try {
        Promise.all([this.myMessagesCLS(user, page), this.myMessagesCables(user, page)]).then(async (r) => {
          r = await r.reduce((total, value) => total.concat(value), []);
          resolve({ m: 'loaded', r });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  viewMessageCable(user, id) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/messages.model');
        this.model().then((issues) => {
          // , { uuid: String(user) }
          issues.aggregate([
            { $match: { $and: [{ _id: new ObjectID(id) }, { t: '1' }] } },
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
                idMessage: '$_id',
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch();
      } catch (e) { reject({ m: e }); }
    });
  }

  viewMessageCls(user, id) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/messages.model');
        this.model().then((issues) => {
          // , { uuid: String(user) }
          issues.aggregate([
            { $match: { $and: [{ _id: new ObjectID(id) }, { t: '2' }] } },
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
                idMessage: '$_id',
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

  viewMessage(user, id, elemnt) {
    return new Promise((resolve, reject) => {
      try {
        switch (elemnt) {
          case 'cable':
            this.viewMessageCable(user, id).then((r) => { resolve({ m: 'loaded', r }); }).catch((e) => { reject({ m: e }); });
            break;
          case 'cls':
            this.viewMessageCls(user, id).then((r) => { resolve({ m: 'loaded', r }); }).catch((e) => { reject({ m: e }); });
            break;
          default:
            reject({ m: 'Element not valid' });
        }
      } catch (e) { reject({ m: e }); }
    });
  }

  deleteMyMessage(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((message) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            message.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete the message' });
              else {
                message.updateOne( //uuid: String(user)
                  { _id: id }, { $set: { deleted: true } }, (err, u) => {
                    if (err) reject({ m: err });
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete the message' });
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
module.exports = Message;
