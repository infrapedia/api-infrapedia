const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const sendEmail = require('../helpers/sendNotificationEmailUsingSendgrid');

const { adms } = require('../helpers/adms');

class Message {
  constructor() {
    this.model = require('../../models/messages.model');
  }

  // TODO: issue reports filtered by deleted
  // TODO: validate the update

  // eslint-disable-next-line class-methods-use-this
  getEmail(user, token) {
    return new Promise((resolve, reject) => {
      try {
        const request = require('request');
        const options = {
          method: 'GET',
          url: `https://infrapedia.auth0.com/api/v2/users/${user}?fields=email,email_verified,name`,
          headers: {
            'content-type': 'application/json',
            Authorization: token,
          },
        };
        request(options, (error, response, body) => {
          if (error || body.hasOwnProperty('statusCode')) reject(`Error:${error}`);
          resolve(body);
        });
      } catch (e) { console.log(e); reject(e); }
    });
  }

  getElementOwner(user, id, type) {
    return new Promise((resolve, reject) => {
      try {
        let Elemnt;
        switch (String(type)) {
          case '1':
            Elemnt = require('./Cable');
            Elemnt = new Elemnt();
            Elemnt.getNameElemnt(id).then((r) => {
              resolve([(r !== undefined) ? r[0].uuid : '', r[0].name, 'Cable']);
            }).catch((e) => {
              console.log(e);
              reject(e);
            });
            break;
          case '2':
            Elemnt = require('./CableLandingStation');
            Elemnt = new Elemnt();
            Elemnt.getNameElemnt(id).then((r) => {
              resolve([(r !== undefined) ? r[0].uuid : '', r[0].name, 'Cable Landing Station']);
            }).catch((e) => {
              reject(e);
            });
            break;
          case '3':
            Elemnt = require('./Facility');
            Elemnt = new Elemnt();
            Elemnt.getNameElemnt(id).then((r) => {
              resolve([(r !== undefined) ? r[0].uuid : '', r[0].name, 'Facility']);
            }).catch((e) => {
              reject(e);
            });
            break;
          case '5':
            Elemnt = require('./InternetExchangePoint');
            Elemnt = new Elemnt();
            Elemnt.getNameElemnt(id).then((r) => {
              resolve([(r !== undefined) ? r[0].uuid : '', r[0].name, 'Internet Exchange Point']);
            }).catch((e) => {
              reject(e);
            });
            break;
          case '6':
            Elemnt = require('./Network');
            Elemnt = new Elemnt();
            Elemnt.getNameElemnt(id).then((r) => {
              resolve([(r !== undefined) ? r[0].uuid : '', r[0].name, 'Group']);
            }).catch((e) => {
              reject(e);
            });
            break;
          case '7':
            Elemnt = require('./Organization');
            Elemnt = new Elemnt();
            Elemnt.getNameElemnt(id).then((r) => {
              resolve([(r !== undefined) ? r[0].uuid : '', r[0].name, 'Organization']);
            }).catch((e) => {
              reject(e);
            });
            break;
          default: reject('Default');
        }
      } catch (e) { console.log(e); reject(e); }
    });
  }

  add(user, data, token) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/messages.model');
        if (user !== undefined || user !== '') {
          this.model().then((message) => {
            const info = {
              uuid: String(user),
              t: data.t,
              elemnt: new ObjectID(data.elemnt),
              email: (data.email),
              phone: (data.phone),
              message: (data.message),
              tags: (Array.isArray(data.tags)) ? data.tags : [],
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              disabled: false,
              viewed: false,
              deleted: false,
            };
            message.insertOne(info, async (err, I) => {
              if (err) reject({ m: err });
              const ejs = require('ejs');
              const sendTicket = require('../helpers/freshdesk');
              // User receives message
              this.getElementOwner(user, data.elemnt, data.t).then((r) => {
                const elemntName = r[1];
                const elemntType = r[2];


                this.getEmail(r[0], token).then((r) => {
                  r = JSON.parse(r);
                  ejs.renderFile('templates/infrapedia/email_notification.ejs', {
                    subject: 'Someone has sent you a message on Infrapedia',
                    email: data.email,
                    phone: data.phone,
                    message: data.message,
                    element: elemntName,
                    type: elemntType,
                    url: process.env._BASEURL,
                  }, (err, html) => {
                    // When we want to include the email of user we can use r.email
                    sendEmail('', `${elemntName} - ${elemntType} - Someone has sent you a message on Infrapedia - ${new Date().getDate()}/${new Date().getMonth() + 1}`, html, data.email);
                    resolve({ m: 'Message sent successfully' });
                  });
                }).catch(() => {
                  ejs.renderFile('templates/infrapedia/email_notification.ejs', {
                    subject: 'A user wrote a message on the app - End user did not receive Email',
                    email: data.email,
                    phone: data.phone,
                    message: data.message,
                    element: data.elemnt,
                    type: data.t,
                    url: process.env._BASEURL,
                  }, (err, html) => {
                    sendEmail('', `A user wrote a message on the app - ${new Date().getDate()}/${new Date().getMonth() + 1}`, html, data.email);
                    resolve({ m: 'Message sent successfully' });
                  });
                });

                // sendTicket(
                //   {
                //     email: data.email,
                //     subject: 'A user received a new message',
                //     description: `${data.message} <br /><br /><strong>${elemntName} - ${elemntType}</strong>`,
                //     status: 2,
                //     priority: 1,
                //   },
                // ).then(() => {
                //   resolve({ m: 'Message sent successfully' });
                // }).catch((err) => {
                //   resolve({ m: 'Message sent successfully' });
                // });
                //
              }).catch((err) => {
                reject({ m: `The message could not be created: ${err}` });
              });
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
            { $match: adms(user) },
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

  facilities(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/facility.model');
        this.model().then((cable) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          cable.aggregate([
            { $match: adms(user) },
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

  cls(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/cls.model');
        this.model().then((cable) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          cable.aggregate([
            { $match: adms(user) },
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
            { $match: adms(user) },
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

  myMessagesCLS(user, page) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/messages.model');
        this.model().then((issues) => {
          page = (parseInt(page) < 1) ? 1 : parseInt(page);
          const limit = 50;
          issues.aggregate([
            { $match: { $and: [{ uuid: user }, { t: '2' }] } },
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
            { $match: { $and: [{ uuid: user }, { t: '1' }] } },
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
          Promise.all([this.CableLandingStations(user, page), this.Cables(user, page), this.facilities(user, page), this.cls(user, page)]).then(async (r) => {
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
        this.model().then((messages) => {
          // , { uuid: String(user) }
          messages.aggregate([
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
                message.updateOne( // uuid: String(user)
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

  makeAnOffer(user, token, data) {
    return new Promise((resolve, reject) => {
      try {
        this.getEmail(user, token).then((userData) => {
          if (data.email !== undefined && data.name !== undefined && data.subject !== undefined) {
            userData = JSON.parse(userData);
            sendEmail('', `${data.name} did an offer | ${data.subject} - ${new Date().getDate()}/${new Date().getMonth() + 1}`, `${data.message} <br /><br /><strong>${data.email} - ${data.name}</strong>`, data.email);
            resolve({ m: 'Your offer was sent' });
            // const sendTicket = require('../helpers/freshdesk');
            // sendTicket(
            //   {
            //     email: data.email,
            //     subject: `${data.name} did an offer | ${data.subject}`,
            //     description: `${data.message} <br /><br /><strong>${userData.email} - ${userData.name}</strong>`,
            //     status: 2,
            //     priority: 1,
            //   },
            // ).then(() => {
            //
            // }).catch((e) => { reject({ m: e }); });
          } else {
            //TODO finish

          }
        }).catch((e) => { console.log(e); });
      } catch (e) { reject({}); }
    });
  }
}
module.exports = Message;
