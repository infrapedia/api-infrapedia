const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Map {
  constructor() {
    this.model = require('../../models/map.model');
  }

  getMyMap(user) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((maps) => {
          maps.aggregate([
            { $match: { uuid: user } },
            {
              $lookup: {
                from: 'facilities',
                let: { f: '$facilities' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$f'],
                      },
                    },
                  },
                  {
                    $addFields: {
                      label: '$name',
                      value: '$_id',
                    },
                  },
                  {
                    $project: {
                      label: 1,
                      value: 1,
                    },
                  },
                ],
                as: 'facilities',
              },
            },
            {
              $lookup: {
                from: 'cables',
                let: { f: '$cables' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$f'],
                      },
                    },
                  },
                  {
                    $addFields: {
                      label: '$name',
                      value: '$_id',
                    },
                  },
                  {
                    $project: {
                      label: 1,
                      value: 1,
                    },
                  },
                ],
                as: 'cables',
              },
            },
            {
              $lookup: {
                from: 'cls',
                let: { f: '$cls' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$f'],
                      },
                    },
                  },
                  {
                    $addFields: {
                      label: '$name',
                      value: '$_id',
                    },
                  },
                  {
                    $project: {
                      label: 1,
                      value: 1,
                    },
                  },
                ],
                as: 'cls',
              },
            },
            {
              $lookup: {
                from: 'ixps',
                let: { f: '$ixps' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$f'],
                      },
                    },
                  },
                  {
                    $addFields: {
                      label: '$name',
                      value: '$_id',
                    },
                  },
                  {
                    $project: {
                      label: 1,
                      value: 1,
                    },
                  },
                ],
                as: 'ixps',
              },
            },
          ]).toArray((err, r) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: r[0] });
          });
        }).catch((e) => {});
      } catch (e) {
        reject({ m: e});
      }
    });
  }

  myMap(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((maps) => {
          // verify if the user if a owner of map
          maps.findOne({ subdomain: data.subdomain }, (err, f) => {
            if (err) reject({ m: err });
            else if (!f) { // Can insert
              maps.insertOne({
                uuid: user,
                subdomain: data.subdomain,
                googleID: data.googleID,
                facilities: data.facilities,
                ixps: data.ixps,
                cls: data.cls,
                cables: data.cables,
                logos: data.logos,
                draw: data.draw,
                rgDate: luxon.DateTime.utc(),
              }, (err, r) => {
                if (err) reject({ m: err });
                resolve({ m: 'New map created' });
              });
            } else if (f.length !== 0 && f.uuid === user) { // can update
              maps.updateOne({ uuid: user }, {
                $set: {
                  uuid: user,
                  subdomain: data.subdomain,
                  googleID: data.googleID,
                  facilities: data.facilities,
                  ixps: data.ixps,
                  cls: data.cls,
                  cables: data.cables,
                  logos: data.logos,
                  draw: JSON.parse(data.draw),
                  rgDate: luxon.DateTime.utc(),
                },
              }, (err, r) => {
                if (err) reject({ m: err });
                resolve({ m: 'Your map was updated' });
              });
            } else { // Can't do
              reject({ m: 'You are not allowed to use this subdomain' });
            }
          });
        }).catch((e) => {});
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Map;
