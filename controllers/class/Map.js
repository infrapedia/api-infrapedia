const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const gcloud = require('../helpers/gcloudStorage');

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
        this.model().then((maps) => {
          // verify if the user if a owner of map
          maps.findOne({ subdomain: data.subdomain }, async (err, f) => {
            if (err) reject({ m: err });
            else if (!f) { // Can insert
              maps.insertOne({
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
                  subsea: (Array.isArray(data.subsea)) ? data.subsea.map((item) => new ObjectID(item)) : [],
                  terrestrials: (Array.isArray(data.terrestrials)) ? data.terrestrials.map((item) => new ObjectID(item)) : [],
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                  techEmail: data.techEmail,
                  techPhone: data.techPhone,
                  saleEmail: data.saleEmail,
                  salePhone: data.salePhone,
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

  segments(id, name, terrestrial, cable) {
    return new Promise((resolve, reject) => {
      try {
        console.log(id, name);
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
            {
              $lookup: {
                from: 'cables',
                let: { subsea: '$subsea', terrestrials: '$terrestrials' },
                pipeline: [
                  {
                    $match:
                      { $or: [{ $expr: { $in: ['$_id', '$$subsea'] } }, { $expr: { $in: ['$_id', '$$terrestrials'] } }] },
                  },
                  {
                    $project: {
                      _id: 1,
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
            let id = 0;
            multipoints = await multipoints[0].ixps.reduce((total, value) => {
              id++;
              value.feature.id = id;
              return total.concat(value.feature);
            }, []);
            multipoints = {
              type: 'FeatureCollection',
              features: multipoints,
            };
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
            {
              $lookup: {
                from: 'facilities',
                let: { facilities: '$facilities' },
                pipeline: [
                  {
                    $match: { $expr: { $in: ['$_id', '$$facilities'] } },
                  },
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
            {
              $lookup: {
                from: 'cls',
                let: { cls: '$cls' },
                pipeline: [
                  {
                    $match: { $expr: { $in: ['$_id', '$$cls'] } },
                  },
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
            gcloud.uploadFilesCustomMap(multipoints, 'cls', subdomain).then((r) => {
              resolve(multipoints);
            }).catch((e) => reject(e));
          });
        }).catch((e) => reject({ m: e }));
      } else { reject({ m: 'subdomain undefined' }); }
    });
  }

  organization(subdomain) {
    return new Promise((resolve, reject) => {
      if (subdomain !== undefined) {
        this.model().then((organization) => {
          organization.aggregate([
            {
              $match: {
                subdomain,
              },
            },
            {
              $project: {
                uuid: 0,
                facilities: 0,
                ixps: 0,
                cls: 0,
                subsea: 0,
                terrestrial: 0,
                config: 0,
                draw: 0,
                rgDate: 0,
              },
            },
          ], (err, data) => {
            if (err) { reject(err); }
            gcloud.uploadFilesCustomMap(data, 'data', subdomain).then((r) => {
              resolve(data);
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
