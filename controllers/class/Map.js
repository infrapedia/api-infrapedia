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
        reject({ m: e });
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
                facilities: (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                ixps: (Array.isArray(data.ixps)) ? data.ixps.map((item) => new ObjectID(item)) : [],
                cls: (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
                cables: (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
                config: data.config,
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
                  facilities: (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                  ixps: (Array.isArray(data.ixps)) ? data.ixps.map((item) => new ObjectID(item)) : [],
                  cls: (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
                  cables: (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
                  config: data.config,
                  logos: (Array.isArray(data.logos)) ? data.logos : [],
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

  cables(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((cables) => {
          cables.aggregate([
            // think better
          ], { allowDiskUse: true }).toArray((err, cs) => {
            if (err) reject({ m: err });
          });
        }).catch((e) => reject({ m: e }));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }

  ixps(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((ixps) => {
          ixps.aggregate([
            {
              $match: {
                subdomain,
              },
            },
            {
              $lookup: {
                from: 'ixps',
                let: { ixps: '$ixps' },
                pipeline: [
                  {
                    $match: { $expr: { $in: ['$_id', '$$ixps'] } },
                  },
                  {
                    $addFields: {
                      feature: {
                        type: 'Feature',
                        geometry: '$geom',
                        properties: {
                          _id: { $toString: '$_id' },
                          name: '$name',
                          type: 'ixps',
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      feature: 1,
                    },
                  },
                ],
                as: 'ixps',
              },
            },
            {
              $project: {
                ixps: 1,
              },
            },
          ], { allowDiskUse: true }).toArray(async (err, multipoints) => {
            if (err) reject({ m: err });
            multipoints = await multipoints[0].ixps.reduce((total, value) => total.concat(value.feature), []);
            multipoints = {
              type: 'FeatureCollection',
              features: multipoints,
            };
            resolve(multipoints);
          });
        }).catch((e) => reject({ m: e }));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }

  facilities(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((facility) => {
          facility.aggregate([
            {
              $match: {
                subdomain,
              },
            },
            {
              $lookup: {
                from: 'facilities',
                let: { facilities: '$facilities' },
                pipeline: [
                  {
                    $match: { $expr: { $in: ['$_id', '$$facilities'] } },
                  },
                  // {
                  //   $addFields: {
                  //     'geom.properties': {
                  //       _id: { $toString: '$_id' },
                  //       name: '$name',
                  //       type: 'ixps',
                  //     },
                  //   },
                  // },
                  {
                    $unwind: '$geom.features',
                  },
                  {
                    $addFields: {
                      feature: {
                        type: 'Feature',
                        geometry: '$geom.features.geometry',
                        properties: {
                          _id: { $toString: '$_id' },
                          name: '$name',
                          type: 'facility',
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      feature: 1,
                    },
                  },
                ],
                as: 'facilities',
              },
            },
            {
              $project: {
                facilities: 1,
              },
            },
          ], { allowDiskUse: true }).toArray(async (err, multipolygon) => {
            if (err) reject({ m: err });
            multipolygon = await multipolygon[0].facilities.reduce((total, value) => total.concat(value.feature), []);
            multipolygon = {
              type: 'FeatureCollection',
              features: multipolygon,
            };
            resolve(multipolygon);
          });
        }).catch((e) => reject({ m: e }));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }

  cls(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((cls) => {
          cls.aggregate([
            {
              $match: {
                subdomain,
              },
            },
            {
              $lookup: {
                from: 'cls',
                let: { cls: '$cls' },
                pipeline: [
                  {
                    $match: { $expr: { $in: ['$_id', '$$cls'] } },
                  },
                  // {
                  //   $addFields: {
                  //     feature: {
                  //       type: 'Feature',
                  //       geometry: '$geom',
                  //       properties: {
                  //         _id: { $toString: '$_id' },
                  //         name: '$name',
                  //         type: 'cls',
                  //       },
                  //     },
                  //   },
                  // },
                  {
                    $unwind: '$geom.features',
                  },
                  {
                    $addFields: {
                      feature: {
                        type: 'Feature',
                        geometry: '$geom.features.geometry',
                        properties: {
                          _id: { $toString: '$_id' },
                          name: '$name',
                          type: 'cls',
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      feature: 1,
                    },
                  },
                ],
                as: 'cls',
              },
            },
            {
              $project: {
                cls: 1,
              },
            },
          ], { allowDiskUse: true }).toArray(async (err, multipoints) => {
            if (err) reject({ m: err });
            multipoints = await multipoints[0].cls.reduce((total, value) => total.concat(value.feature), []);
            multipoints = {
              type: 'FeatureCollection',
              features: multipoints,
            };
            resolve(multipoints);
          });
        }).catch((e) => reject({ m: e }));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }
}
module.exports = Map;
