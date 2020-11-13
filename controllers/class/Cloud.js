const luxon = require('luxon');
const GJV = require('geojson-validation');
const fs = require('fs');
const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');
// const geojsonHint = require('@mapbox/geojsonhint');
const slugToString = require('../helpers/slug');
const { adms } = require('../helpers/adms');

class Cloud {
  constructor() {
    this.model = require('../../models/cloud.model');
  }

  add(usr, data) {
    return new Promise((resolve, reject) => {
      try {
        data = {
          uuid: String(usr),
          name: String(data.name),
          establisYear: parseInt(data.establisYear),
          url: String(data.url),
          statusPageUrl: String(data.statusPageUrl),
          color: data.color,
          cloudRegion: JSON.parse(data.cloudRegion),
          onRamp: JSON.parse(data.onRamp),
          knownUsers: data.knownUsers((company) => new ObjectID(company)),
        };
        this.model().then((cloud) => {
          cloud.find({ name: String(data.name) }).count((err, c) => {
            // eslint-disable-next-line no-empty
            if (err) { } else if (c === 0) {
              cloud.insertOne(data, async (err, i) => {
                if (err) reject({ m: err + 0 });
              });
            } else {
              reject('');
            }
          });
        }).catch((e) => reject(e));
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  edit(usr, data) {
    return new Promise((resolve, reject) => {
      try {
        data = {
          name: String(data.name),
          establisYear: parseInt(data.establisYear),
          url: String(data.url),
          statusPageUrl: String(data.statusPageUrl),
          color: data.color,
          cloudRegion: JSON.parse(data.cloudRegion),
          onRamp: JSON.parse(data.onRamp),
          knownUsers: data.knownUsers((company) => new ObjectID(company))
        };
        this.model().then((cloud) => {
          cloud.updateOne({
            _id: new ObjectID(data._id),
            uuid: String(usr),
          }, { $set: data }, (err, u) => {
            if (err) reject(err);
            else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
            else {
              resolve({ m: 'CLS updated', r: data });
            }
          });
        }).catch((e) => reject(e));
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((cls) => {
            id = new ObjectID(id);
            cls.aggregate([
              {
                $match: {
                  _id: id,
                },
              },
              {
                $lookup: {
                  from: 'organizations',
                  let: { f: '$knownUsers' },
                  pipeline: [
                    {
                      $match: {
                        $and: [
                          {
                            $expr: {
                              $in: ['$_id', {
                                $cond: {
                                  if: { $isArray: '$$f' },
                                  then: '$$f',
                                  else: [],
                                },
                              }],
                            },
                          },
                          {
                            deleted: { $ne: true },
                          },
                        ],
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        label: '$name',
                      },
                    },
                  ],
                  as: 'knownUsers',
                },
              },
            ]).toArray((err, o) => {
              if (err) reject(err);
              if (o !== undefined) {
                resolve({ m: 'Loaded', r: o[0] });
              } else {
                reject({ m: 'Not found' });
              }
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((facilities) => {
            facilities.aggregate([
              {
                $project: {
                  name: 1,
                  uuid: 1,
                  deleted: 1,
                  rgDate: 1,
                  uDate: 1,
                },
              },
              {
                $sort: { name: 1 },
              },
              {
                $match: adms(user),
              },
              { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
              { $limit: limit },
            ]).toArray((err, rCables) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rCables });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  search(user, search) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cable) => {
          const uuid = (search.psz === '1') ? adms(user) : {};
          cable.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
            {
              $match: { $and: [{ name: { $regex: search.s, $options: 'i' } }, uuid, { deleted: { $ne: true } }] }, // , uuid, { deleted: { $ne: true } } { $and: [uuid, , { deleted: false }] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            { $sort: { name: 1, yours: -1 } },
            { $limit: 20 },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Cloud;
