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
          knownUsers: data.knownUsers((company) => new ObjectID(company))
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
}
module.exports = Cloud;
