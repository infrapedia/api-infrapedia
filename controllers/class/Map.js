const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const gcloud = require('../helpers/gcloudStorage');
const redisClient = require('../../config/redis');

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
                let: { fs: '$subsea' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$fs'],
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
                as: 'subsea',
              },
            },
            {
              $lookup: {
                from: 'cables',
                let: { ft: '$terrestrials' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$ft'],
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
                as: 'terrestrials',
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
            resolve({ m: 'Loaded', r });
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
        const dataMap = data;
        this.model().then((maps) => {
          // verify if the user if a owner of map
          maps.findOne({ subdomain: dataMap.subdomain }, async (err, f) => {
            if (err) reject({ m: err });
            else if (!f) { // Can insert
              maps.insertOne({
                uuid: user,
                subdomain: dataMap.subdomain,
                googleID: dataMap.googleID,
                facilities: (Array.isArray(dataMap.facilities)) ? dataMap.facilities.map((item) => new ObjectID(item)) : [],
                ixps: (Array.isArray(dataMap.ixps)) ? dataMap.ixps.map((item) => new ObjectID(item)) : [],
                cls: (Array.isArray(dataMap.cls)) ? dataMap.cls.map((item) => new ObjectID(item)) : [],
                subsea: (Array.isArray(dataMap.subsea)) ? data.subsea.map((item) => new ObjectID(item)) : [],
                terrestrials: (Array.isArray(dataMap.terrestrials)) ? data.terrestrials.map((item) => new ObjectID(item)) : [],
                address: await (dataMap.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                techEmail: dataMap.techEmail,
                techPhone: dataMap.techPhone,
                saleEmail: dataMap.saleEmail,
                salePhone: dataMap.salePhone,
                config: dataMap.config,
                logos: dataMap.logos,
                draw: dataMap.draw,
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
                  subsea: (Array.isArray(data.subsea)) ? data.subsea.map((item) => new ObjectID(item)) : [],
                  terrestrials: (Array.isArray(data.terrestrials)) ? data.terrestrials.map((item) => new ObjectID(item)) : [],
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                  techEmail: data.techEmail,
                  techPhone: data.techPhone,
                  saleEmail: data.saleEmail,
                  salePhone: data.salePhone,
                  config: dataMap.config,
                  logos: (Array.isArray(data.logos)) ? data.logos : [],
                  draw: dataMap.draw,
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
        }).catch((e) => {
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  getConfig(subdomain) {
    return new Promise((resolve, reject) => {
      this.model().then((map) => {
        map.aggregate([{ $match: { subdomain } }, { $project: { config: 1 } }])
          .toArray((err, r) => {
            if (err) reject(err);
            resolve(r);
          });
      });
    });
  }

  segments(id, name, terrestrial, cable) {
    return new Promise((resolve, reject) => {
      try {
        const mSegments = require('../../models/cable_segments.model');
        mSegments().then((segments) => {
          segments.aggregate([
            {
              $match: {
                cable_id: new ObjectID(id),
              },
            },
            {
              $addFields: {
                id: cable,
                // properties: config,
                'properties.id': cable,
                'properties.nameCable': name,
                'properties.terrestrial': terrestrial,
              },
            },
          ], {
            allowDiskUse: true,
          }).toArray((err, s) => {
            if (err) reject(err);
            resolve(s);
          });
        }).catch((e) => { reject(e); });
      } catch (e) { reject(e); }
    });
  }

  cables(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((cables) => {
          cables.aggregate([
            {
              $match: {
                subdomain,
              },
            },
            // {
            //   $addFields: {
            //     config: { $concatArrays: ['$subsea', '$terrestrials'] },
            //   },
            // },
            {
              $lookup: {
                from: 'cables',
                let: { subsea: '$subsea', terrestrials: '$terrestrials' }, // config: '$config'
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      terrestrial: 1,
                      name: 1,
                    },
                  },
                  {
                    $match:
                      { $or: [{ $expr: { $in: ['$_id', '$$subsea'] } }, { $expr: { $in: ['$_id', '$$terrestrials'] } }] },
                  },
                  // {
                  //   $unwind: '$config',
                  // },
                  // {
                  //   $addFields: {
                  //     //   'config._id': { $toObjectId: '$config._id' },
                  //     equal: { $cond: [{ $eq: ['$config._id', { $toString: '$_id' }] }, true, false] },
                  //   },
                  // },
                  // {
                  //   $match: { equal: true },
                  // },
                  {
                    $project: {
                      _id: 1,
                      equal: 1,
                      config: 1,
                      name: 1,
                      terrestrial: 1,
                    },
                  },
                ],
                as: 'cables',
              },
            },
            {
              $project: {
                cables: 1,
              },
            },
          ], { allowDiskUse: true }).toArray(async (err, cables) => {
            if (err) reject({ m: err });
            let cable = 0;
            Promise.all(cables[0].cables.map((c) => { cable++; return this.segments(c._id, c.name, c.terrestrial, cable); })).then(async (multiLines) => {
              multiLines = {
                type: 'FeatureCollection',
                features: await multiLines.reduce((total, value) => total.concat(value), []),
              };
              redisClient.set(`${subdomain}_cables`, JSON.stringify(multiLines), 'EX', 2147483647);
              gcloud.uploadFilesCustomMap(multiLines, 'cables', subdomain).then((r) => {
                resolve(multiLines);
              }).catch((e) => reject(e));
            }).catch((e) => reject({ m: e }));
          });
        }).catch((e) => reject({ m: e }));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }

  draw(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((draw) => {
          draw.findOne({ subdomain }, (err, d) => {
            if (err) reject({ m: err });
            redisClient.set(`${subdomain}_draw`, JSON.stringify(d.draw), 'EX', 2147483647);
            gcloud.uploadFilesCustomMap(d.draw, 'draw', subdomain).then((r) => {
              resolve(d.draw);
            }).catch((e) => { reject(e); });
          });
        }).catch((e) => reject({ m: e }));
      }
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
            // {
            //   $addFields: {
            //     config: '$ixps',
            //   },
            // },
            {
              $lookup: {
                from: 'ixps',
                let: { ixps: '$ixps' },
                pipeline: [
                  // {
                  //   $addFields: { config: '$$config' },
                  // },
                  {
                    $match: { $expr: { $in: ['$_id', '$$ixps'] } },
                  },
                  // {
                  //   $unwind: '$config',
                  // },
                  // {
                  //   $addFields: {
                  //     equal: { $cond: [{ $eq: ['$config._id', { $toString: '$_id' }] }, true, false] },
                  //   },
                  // },
                  // {
                  //   $match: { equal: true },
                  // },
                  // {
                  //   $addFields: {
                  //     'feature.properties': '$config',
                  //   },
                  // },
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
          ], { allowDiskUse: true }).toArray(async (err, multipointsIxps) => {
            if (err) reject({ m: err });
            let id = 0;
            let multipoints = await multipointsIxps[0].ixps.reduce((total, value) => {
              id++;
              value.feature.id = id;
              return total.concat(value.feature);
            }, []);
            multipoints = {
              type: 'FeatureCollection',
              features: multipoints,
            };
            redisClient.set(`${subdomain}_ixps`, JSON.stringify(multipoints), 'EX', 2147483647);
            gcloud.uploadFilesCustomMap(multipoints, 'ixps', subdomain).then((r) => {
              resolve(multipoints);
            }).catch((e) => reject(e));
            // resolve(multipoints);
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
            // {
            //   $addFields: {
            //     config: '$facilities',
            //   },
            // },
            {
              $lookup: {
                from: 'facilities',
                let: { facilities: '$facilities' }, // , config: '$config'
                pipeline: [
                  // {
                  //   $addFields: { config: '$$config' },
                  // },
                  {
                    $match: { $expr: { $in: ['$_id', '$$facilities'] } },
                  },
                  {
                    $unwind: '$geom.features',
                  },
                  // {
                  //   $unwind: '$config',
                  // },
                  // {
                  //   $addFields: {
                  //     equal: { $cond: [{ $eq: ['$config._id', { $toString: '$_id' }] }, true, false] },
                  //   },
                  // },
                  // {
                  //   $match: { equal: true },
                  // },
                  // {
                  //   $addFields: {
                  //     'feature.properties': '$config',
                  //   },
                  // },
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
            let id = 0;
            multipolygon = await multipolygon[0].facilities.reduce((total, value) => {
              id++;
              value.feature.id = id;
              return total.concat(value.feature);
            }, []);
            multipolygon = {
              type: 'FeatureCollection',
              features: multipolygon,
            };
            redisClient.set(`${subdomain}_facilities`, JSON.stringify(multipolygon), 'EX', 2147483647);
            gcloud.uploadFilesCustomMap(multipolygon, 'facilities', subdomain).then((r) => {
              resolve(multipolygon);
            }).catch((e) => reject(e));
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
            // {
            //   $addFields: {
            //     config: '$config.cls',
            //   },
            // },
            {
              $lookup: {
                from: 'cls',
                let: { cls: '$cls' },
                pipeline: [
                  //
                  // {
                  //   $addFields: { config: '$$config' },
                  // },
                  {
                    $match: { $expr: { $in: ['$_id', '$$cls'] } },
                  },
                  {
                    $unwind: '$geom.features',
                  },
                  // {
                  //   $unwind: '$config',
                  // },
                  // {
                  //   $addFields: {
                  //     equal: { $cond: [{ $eq: ['$config._id', { $toString: '$_id' }] }, true, false] },
                  //   },
                  // },
                  // {
                  //   $match: { equal: true },
                  // },
                  // {
                  //   $addFields: {
                  //     'feature.properties': '$config',
                  //   },
                  // },
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
            let id = 0;
            multipoints = await multipoints[0].cls.reduce((total, value) => {
              id++;
              value.feature.id = id;
              return total.concat(value.feature);
            }, []);
            multipoints = {
              type: 'FeatureCollection',
              features: multipoints,
            };
            redisClient.set(`${subdomain}_cls`, JSON.stringify(multipoints), 'EX', 2147483647);
            gcloud.uploadFilesCustomMap(multipoints, 'cls', subdomain).then((r) => {
              resolve(multipoints);
            }).catch((e) => reject(e));
          });
        }).catch((e) => reject({ m: e }));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }

  setInfo(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((orgData) => {
          orgData.aggregate(
            [
              { $match: { subdomain } },
              {
                $project: {
                  _id: 1,
                  subdomain: 1,
                  googleID: 1,
                  address: 1,
                  techEmail: 1,
                  techPhone: 1,
                  saleEmail: 1,
                  salePhone: 1,
                  logos: 1,
                },
              },
            ],
          ).toArray((err, d) => {
            redisClient.set(`${subdomain}_info`, JSON.stringify(d), 'EX', 2147483647);
            gcloud.uploadFilesCustomMap(d, 'info', subdomain).then((r) => {
              resolve(d);
            }).catch((e) => reject(e));
          });
        }).catch((e) => reject(e));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }

  getinfo(subdomain) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((map) => {
          map.aggregate([
            { $project: { subdomain: 1, logos: 1 } },
            { $match: { subdomain } }], (err, result) => {
            if (err) reject({ m: err });
            resolve({ m: 'loaded', r: result });
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }

  view(subdomain) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((map) => {
          map.aggregate([
            { $match: { subdomain } },
            { $project: { } },
          ], { allowDiskUse: true }, (err, r) => {
            if (err) reject({ m: err });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Map;
