const luxon = require('luxon');
const GJV = require('geojson-validation');
const fs = require('fs');
const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');
// const geojsonHint = require('@mapbox/geojsonhint');

const { adms } = require('../helpers/adms');

let segmentsCounts = 0;

class Cable {
  constructor() {
    this.model = require('../../models/cable.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cables) => {
            this.model().then(async (cables) => {
            // create file
              const nameFile = Math.floor(Date.now() / 1000);
              const stream = await fs.createWriteStream(`./temp/${nameFile}.json`);
              stream.write(data.geom);
              stream.end(async () => {
                const geomData = await fs.readFileSync(`./temp/${nameFile}.json`, 'utf8');
                const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
                data = {
                  uuid: String(user),
                  name: String(data.name),
                  // cc: String(data.cc),
                  notes: '', // String(data.notes)
                  systemLength: String(data.systemLength),
                  activationDateTime: (activationDateTime !== '') ? luxon.DateTime.fromJSDate(activationDateTime).toUTC() : '',
                  urls: (Array.isArray(data.urls)) ? data.urls : [],
                  terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
                  capacityTBPS: String(data.capacityTBPS),
                  litCapacity: await (Array.isArray(data.litCapacity)) ? data.litCapacity.map((item) => JSON.parse(item)) : [],
                  fiberPairs: String(data.fiberPairs),
                  category: String(data.category),
                  facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                  owners: await (Array.isArray(data.owners)) ? data.owners.map((item) => new ObjectID(item)) : [],
                  cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
                  geom: {}, // (geomData !== '') ? JSON.parse(geomData) : {}
                  tags: data.tags,
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: false,
                  deleted: false,
                };
                let listSegments = JSON.parse(geomData);
                cables.find({ name: data.name }, (err, c) => {
                  if (err) reject({ m: err + 0 });
                  else if (c.length > 0 && c._id !== data._id) reject({ m: 'We have another element with the same name' });
                  cables.insertOne(data, async (err, i) => {
                    // TODO: validation insert
                    if (err) reject({ m: err + 0 });
                    //
                    if (Array.isArray(data.cls)) {
                      let cableLandingStation = require('./CableLandingStation');
                      cableLandingStation = new cableLandingStation();
                      await data.cls.map((c) => {
                        cableLandingStation.updateCable(user, c, i.insertedId).then((r) => '').catch((e) => '');
                      });
                    }
                    // we going to update the segments
                    // insert the segments
                    const segments = require('../../models/cable_segments.model');
                    segments().then(async (segments) => {
                      let ssafe = 0;
                      listSegments = listSegments.features;
                      await listSegments.map(async (sg) => {
                        await segments.insertOne({
                          cable_id: new ObjectID(i.insertedId),
                          type: 'Feature',
                          properties: sg.properties,
                          geometry: sg.geometry,
                        }, (err, r) => {
                          ssafe += 1;
                          segmentsCounts += 1;
                          fs.unlink(`./temp/${nameFile}.json`, (err) => {
                            resolve({ m: 'Cable created', r: i.insertedId });
                          });
                        });
                      });
                    }).catch((e) => {
                      reject({ m: 'error saving segments' });
                    });
                  });
                });
              });
            }).catch((e) => reject({ m: e + 1 }));
          }).catch((e) => reject({ m: e + 1 }));
          // else { resolve('Not user found'); }
        }
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (cables) => {
          // eslint-disable-next-line camelcase
          cables.find({ cableid: String(data.cableid) }).count(async (err, c) => {
            if (err) resolve({ m: err });
            else if (c > 0) resolve({ m: 'We have registered in our system more than one organization with the same name' });
            else {
              // create file
              const nameFile = Math.floor(Date.now() / 1000);
              let listSegments = data.geom;
              data = {
                uuid: '',
                cableid: String(data.cableid),
                name: String(data.name),
                notes: '', // String(data.notes)
                systemLength: String(data.systemLength),
                activationDateTime: luxon.DateTime.fromJSDate(data.activationDateTime).toUTC(),
                urls: (Array.isArray(data.urls)) ? data.urls : [],
                terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
                capacityTBPS: String(data.capacityTBPS),
                litCapacity: [],
                fiberPairs: String(data.fiberPairs),
                category: '',
                facilities: [],
                owners: [],
                geom: [],
                tags: [],
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
                status: false,
                deleted: false,
              };
              cables.insertOne(data, (err, i) => {
                // TODO: validation insert
                if (err) reject({ m: err + 0 });
                // insert the segments
                const segments = require('../../models/cable_segments.model');
                segments().then(async (segments) => {
                  let ssafe = 0;
                  listSegments = await listSegments.map(async (sg) => {
                    await segments.insertOne({
                      cable_id: new ObjectID(i.insertedId),
                      type: 'Feature',
                      properties: {
                        name: sg.segment_name,
                        status: (sg.status === 1) ? 'Active' : 'Inactive',
                        stroke: '#CCCCCC',
                        'stroke-width': 1.2,
                        'stroke-opacity': 1,
                      },
                      geometry: sg.geom,
                    }, (err, r) => {
                      ssafe += 1;
                      segmentsCounts += 1;
                      console.log('TRANSFERING ------ ', String(data.cableid), listSegments.length, ssafe);
                      console.log('TRANSFERED ------------------------------------', segmentsCounts);
                      resolve({ m: 'Cable created' });
                    });
                  });
                }).catch((e) => {
                  console.log('error transfer segments');
                });
              });
            }
          });
        }).catch((e) => reject({ m: e + 1 }));
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cables) => {
            const nameFile = Math.floor(Date.now() / 1000);
            const stream = await fs.createWriteStream(`./temp/${nameFile}.json`);
            stream.write(data.geom);
            stream.end(async () => {
              const geomData = await fs.readFileSync(`./temp/${nameFile}.json`, 'utf8');
              const id = new ObjectID(data._id);
              const idUpdate = data._id;
              const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
              const cls = (Array.isArray(data.cls)) ? data.cls : [];
              data = {
                uuid: String(user),
                name: String(data.name),
                // cc: String(data.cc),
                systemLength: String(data.systemLength),
                activationDateTime: (activationDateTime !== '') ? luxon.DateTime.fromJSDate(activationDateTime).toUTC() : '',
                urls: (data.urls !== '') ? data.urls : [],
                terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
                capacityTBPS: String(data.capacityTBPS),
                litCapacity: await (Array.isArray(data.litCapacity)) ? data.litCapacity.map((item) => JSON.parse(item)) : [],
                fiberPairs: String(data.fiberPairs),
                // notes: String(data.notes),
                category: String(data.category),
                facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                owners: await (Array.isArray(data.owners)) ? data.owners.map((item) => new ObjectID(item)) : [],
                cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
                geom: {}, // (geomData !== '') ? JSON.parse(geomData) : {},
                tags: data.tags,
                uDate: luxon.DateTime.utc(),
              };
              // we're going to search if the user is the own of the cable
              let listSegments = JSON.parse(geomData);
              cables.findOne({ $and: [adms(user), { _id: id }] }, (err, c) => {
                console.log(c);
                if (err) reject({ m: err });
                const segments = require('../../models/cable_segments.model');
                segments().then(async (segments) => {
                  segments.remove({ cable_id: id }, (err, d) => {
                    if (err) reject({ m: err });
                    cables.updateOne({ $and: [adms(user), { _id: id }] }, { $set: data }, async (err, u) => {
                      if (err) reject({ m: err });
                      else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
                      else {
                        // update the CLS connection
                        if (Array.isArray(cls)) {
                          let cableLandingStation = require('./CableLandingStation');
                          cableLandingStation = new cableLandingStation();
                          (function () {
                            return new Promise((resolve) => {
                              let zero = 1;
                              c.cls.map((i) => {
                                console.log(c.cls.length, zero);
                                if (c.cls.length === zero) {
                                  if (!data.cls.includes(String(i))) {
                                    cableLandingStation.removeCable(user, i, idUpdate).then(() => {
                                      console.log('update 1');
                                    }).catch(() => console.log('not update'));
                                  }
                                } else {
                                  if (!data.cls.includes(String(i))) {
                                    cableLandingStation.removeCable(user, i, idUpdate).then(() => {
                                      console.log('update 1');
                                    }).catch(() => console.log('not update'));
                                  }
                                  console.log('resolved');
                                  resolve();
                                }
                                zero += 1;
                              });
                            });
                          }(c)).then(async () => {
                            await cls.map((i) => {
                              cableLandingStation.updateCable(user, i, idUpdate).then(() => console.log('update 2')).catch(() => console.log('not update'));
                            });
                          });
                        }
                        // update the segments
                        let ssafe = 0;
                        listSegments = listSegments.features;
                        await listSegments.map(async (sg) => {
                          await segments.insertOne({
                            cable_id: id,
                            type: 'Feature',
                            properties: sg.properties,
                            geometry: sg.geometry,
                          }, (err, r) => {
                            ssafe += 1;
                            segmentsCounts += 1;
                            fs.unlink(`./temp/${nameFile}.json`, (err) => {
                              resolve({ m: 'Cable updated' });
                            });
                          });
                        });
                      }
                    });
                  });
                });
              });
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  listT(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((cables) => {
            cables.aggregate([
              {
                $sort: { name: 1 },
              },
              {
                $match: {
                  $and: [
                    adms(user),
                    { terrestrial: true },
                    { deleted: false },
                  ],
                },
              },
              { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
              { $limit: limit },
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
                      $project: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  ],
                  as: 'facilities',
                },
              },
              {
                $lookup: {
                  from: 'alerts',
                  let: { elemnt: { $toString: '$_id' } },
                  pipeline: [
                    {
                      $match: { $expr: { $and: [{ $eq: ['$elemnt', '$$elemnt'] }] } },
                    },
                    { $count: 'elmnt' },
                  ],
                  as: 'alerts',
                },
              },
              {
                $addFields: { alerts: { $arrayElemAt: ['$alerts.elmnt', 0] } },
              },
              {
                $project: {
                  uuid: 0,
                  geom: 0,
                },
              }]).toArray((err, rCables) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rCables });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  listS(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((cables) => {
            cables.aggregate([
              {
                $sort: { name: 1 },
              },
              {
                $match: {
                  $and: [
                    adms(user),
                    { terrestrial: false },
                    { deleted: false },
                  ],
                },
              },
              { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
              { $limit: limit },
              // {
              //   $lookup: {
              //     from: 'facilities',
              //     let: { f: '$facilities' },
              //     pipeline: [
              //       {
              //         $match: {
              //           $expr: {
              //             $in: ['$_id', '$$f'],
              //           },
              //         },
              //       },
              //       {
              //         $project: {
              //           _id: 1,
              //           name: 1,
              //         },
              //       },
              //     ],
              //     as: 'facilities',
              //   },
              // },
              {
                $lookup: {
                  from: 'alerts',
                  let: { elemnt: { $toString: '$_id' } },
                  pipeline: [
                    {
                      $match: { $expr: { $and: [{ $eq: ['$elemnt', '$$elemnt'] }] } },
                    },
                    { $count: 'elmnt' },
                  ],
                  as: 'alerts',
                },
              },
              {
                $addFields: { alerts: { $arrayElemAt: ['$alerts.elmnt', 0] } },
              },
              {
                $project: {
                  uuid: 0,
                  geom: 0,
                },
              }]).toArray((err, rCables) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rCables });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  shortList(user) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((cables) => {
            cables.aggregate([
              {
                $sort: { name: 1 },
              },
              {
                $match: {
                  $and: [
                    adms(user),
                    { deleted: false },
                  ],
                },
              }, {
                $project: {
                  _id: 1,
                  name: 1,
                  terrestrial: 1,
                  category: 1,
                  status: 1,
                },
              }]).toArray((err, rCables) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rCables });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  delete(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cables) => {
            id = new ObjectID(id);
            // TODO: we need to validate if  don't have another organization with the same name
            cables.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your cable' });
              else {
                cables.updateOne(
                  { $and: [adms(user), { _id: id }] }, { $set: { deleted: true, uDate: luxon.DateTime.utc() } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your cable' });
                    else resolve({ m: 'Deleted' });
                  },
                );
              }
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  cableInformation(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cables) => {
          cables.aggregate([
            {
              $match: {
                _id: new ObjectID(id),
              },
            },
            {
              $lookup: {
                from: 'facilities',
                let: { f: '$facilities' },
                pipeline: [
                  {
                    $match: {
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
                  },
                  {
                    $project: {
                      label: '$name',
                    },
                  },
                ],
                as: 'facilities',
              },
            },
            {
              $lookup: {
                from: 'organizations',
                let: { f: '$owners' },
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
                          deleted: false,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      label: '$name',
                    },
                  },
                ],
                as: 'owners',
              },
            },
            {
              $lookup: {
                from: 'cls',
                let: { f: '$cls' },
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
                          deleted: false,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      label: '$name',
                    },
                  },
                ],
                as: 'cls',
              },
            },
          ], {
            allowDiskUse: true,
          }).toArray((err, o) => {
            if (err) reject(err);
            resolve(o);
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject(e); }
    });
  }

  segments(id) {
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

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          Promise.all([this.cableInformation(id), this.segments(id)]).then((r) => {
            r[0][0].geom = {
              type: 'FeatureCollection',
              features: r[1],
            };
            resolve({
              m: 'Loaded',
              r: r[0][0],
            });
          }).catch((e) => { console.log(e); reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  getBoundsCoords(coords) {
    return new Promise((resolve, reject) => {
      try {
        const reduceCoords = [];
        for (let i = 0; i < coords.length; ++i) {
          for (let j = 0; j < coords[i].length; ++j) { reduceCoords.push(coords[i][j]); }
        }
        resolve(reduceCoords);
      } catch (e) { reject(e); }
    });
  }

  bbox(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/cable_segments.model');
        this.model().then((cablesSegment) => {
          cablesSegment.aggregate([
            {
              $project: {
                cable_id: 1,
                'geometry.coordinates': 1,
              },
            },
            {
              $match: {
                cable_id: new ObjectID(id),
              },
            },
          ]).toArray((err, c) => {
            if (err) { reject(err); } else if (c[0] !== undefined) {
              if (c[0].geometry !== undefined) {
                const coordinates = [c[0].geometry.coordinates, c[(c.length - 1)].geometry.coordinates];
                this.getBoundsCoords([].concat(...coordinates)).then((r) => {
                  resolve({ m: 'Loaded', r: [r[0], r[r.length - 1]] });
                }).catch((e) => { reject({ m: e }); });
              }
            }
          });
        });
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
              $addFields: { name: { $toLower: '$name' } },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s, $options: 'i' } }, { deleted: false }] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $project: {
                _id: 1,
                name: 1,
                terrestrial: 1,
                yours: 1,
                alerts: 1,
              },
            },
            { $sort: { yours: -1 } },
            { $limit: 20 },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  searchT(user, search) {
    return new Promise((resolve, reject) => {
      try {
        const uuid = (search.psz === '1') ? adms(user) : {};
        this.model().then((cable) => {
          cable.aggregate([
            {
              $sort: { name: 1 },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s, $options: 'i' } }, { terrestrial: true }, { deleted: false }] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $lookup: {
                from: 'alerts',
                let: { elemnt: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: { $expr: { $and: [{ $eq: ['$elemnt', '$$elemnt'] }] } },
                  },
                  { $count: 'elmnt' },
                ],
                as: 'alerts',
              },
            },
            {
              $addFields: { alerts: { $arrayElemAt: ['$alerts.elmnt', 0] } },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                terrestrial: 1,
                yours: 1,
                alerts: 1,
              },
            },
            { $sort: { yours: -1 } },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  searchS(user, search) {
    return new Promise((resolve, reject) => {
      try {
        const uuid = (search.psz === '1') ? adms(user) : {};
        this.model().then((cable) => {
          cable.aggregate([
            {
              $sort: { name: 1 },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s, $options: 'i' } }, { terrestrial: false }, { deleted: false }] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $lookup: {
                from: 'alerts',
                let: { elemnt: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: { $expr: { $and: [{ $eq: ['$elemnt', '$$elemnt'] }] } },
                  },
                  { $count: 'elmnt' },
                ],
                as: 'alerts',
              },
            },
            {
              $addFields: { alerts: { $arrayElemAt: ['$alerts.elmnt', 0] } },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                terrestrial: 1,
                yours: 1,
                alerts: 1,
              },
            },
            { $sort: { yours: -1 } },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  view(user, id) {
    return new Promise((resolve, reject) => {
      try {
        redisClient.redisClient.get(`v_cable_${id}`, (err, reply) => {
          if (err) reject({ m: err });
          else if (reply) resolve(((JSON.parse(reply))));
          else {
            this.model().then((cables) => {
              cables.aggregate([
                {
                  $match: {
                    _id: new ObjectID(id),
                  },
                },
                {
                  $project: { geom: 0 },
                },
                {
                  $lookup: {
                    from: 'facilities',
                    let: { f: '$facilities' },
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
                                },
                                ],
                              },
                            },
                            {
                              deleted: false,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                    ],
                    as: 'facilities',
                  },
                },
                {
                  $lookup: {
                    from: 'cls',
                    let: { f: '$cls' },
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
                                },
                                ],
                              },
                            },
                            {
                              deleted: false,
                            },
                          ],
                        },
                      },
                      {
                        $addFields: {
                          name: { $concat: ['$name', ' ', { $ifNull: ['$country', ''] }] },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                    ],
                    as: 'cls',
                  },
                },
                // {
                //   $lookup: {
                //     from: 'cls',
                //     let: { f: '$_id' },
                //     pipeline: [
                //       {
                //         $match: {
                //           $and: [
                //             {
                //               $expr: {
                //                 $in: ['$cables', {
                //                   $cond: {
                //                     if: { $isArray: '$$f' },
                //                     then: '$$f',
                //                     else: [],
                //                   },
                //                 }],
                //               },
                //             },
                //             {
                //               deleted: false,
                //             },
                //           ],
                //         },
                //       },
                //       {
                //         $project: {
                //           _id: 1,
                //           name: 1,
                //         },
                //       },
                //     ],
                //     as: 'cls',
                //   },
                // },
                {
                  $lookup: {
                    from: 'networks',
                    let: { f: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$cables', {
                                  $cond: {
                                    if: { $isArray: '$$f' },
                                    then: '$$f',
                                    else: [],
                                  },
                                }],
                              },
                            },
                            {
                              deleted: false,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          organizations: 1,
                        },
                      },
                    ],
                    as: 'networks',
                  },
                },
                {
                  $lookup: {
                    from: 'organizations',
                    let: { networks: '$networks' },
                    pipeline: [
                      {
                        $addFields: {
                          idsorgs: { $map: { input: '$$networks.organizations', as: 'orgs', in: '$$orgs' } },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', {
                                  $cond: {
                                    if: { $isArray: { $arrayElemAt: ['$idsorgs', 0] } },
                                    then: { $arrayElemAt: ['$idsorgs', 0] },
                                    else: [],
                                  },
                                },
                                ],
                              },
                            },
                            {
                              deleted: false,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                    ],
                    as: 'organizations',
                  },
                },
                {
                  $lookup: {
                    from: 'organizations',
                    let: { f: '$owners' },
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
                              deleted: false,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                    ],
                    as: 'owners',
                  },
                },
                {
                  $lookup: {
                    from: 'alerts',
                    let: { elemnt: { $toString: '$_id' } },
                    pipeline: [
                      {
                        $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '1' }, { uuid: user }, { disabled: false }] },
                      },
                    ],
                    as: 'alert',
                  },
                },
                {
                  $addFields: { alert: { $size: '$alert' } },
                },
                {
                  $addFields: {
                    RFS: {
                      $cond: [
                        { $ne: ['', '$activationDateTime'] },
                        {
                          $concat: [
                            {
                              $cond: [
                                { $lte: [{ $month: { $toDate: '$activationDateTime' } }, 3] },
                                'Q1',
                                {
                                  $cond: [{ lte: [{ $month: { $toDate: '$activationDateTime' } }, 6] },
                                    'Q2',
                                    {
                                      $cond: [{ $lte: [{ $month: { $toDate: '$activationDateTime' } }, 9] },
                                        'Q3',
                                        'Q4',
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                            '-',
                            { $toString: { $sum: [{ $year: { $toDate: '$activationDateTime' } }, 0] } },
                          ],
                        },
                        '',
                      ],
                    },
                  },
                },
                {
                  $project: {
                    geom: 0,
                    status: 0,
                    deleted: 0,
                  },
                },
              ]).toArray((err, c) => {
                if (err) reject(err);
                redisClient.set(`v_cable_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
                resolve({ m: 'Loaded', r: c });
              });
            });
          }
        });
      } catch (e) { reject({ m: e }); }
    });
  }


  getNameElemnt(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cables) => {
          cables.aggregate([
            {
              $project: {
                _id: 1,
                uuid: 1,
                name: 1,
              },
            },
            {
              $match: {
                _id: new ObjectID(id),
              },
            },
          ]).toArray((err, c) => {
            if (err) reject(err);
            resolve(c);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  getElementGeom(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cables) => {
          cables.aggregate([
            {
              $match: {
                _id: new ObjectID(id),
              },
            },
            {
              $project: {
                geom: 1,
              },
            },
          ]).toArray((err, r) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r: r[0].geom });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  getMultiElementsGeom(ids) {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(ids) || ids.length === 0) resolve({ m: 'Loaded', r: [] });
        ids = ids.map((i) => new ObjectID(i));
        this.model().then((cables) => {
          cables.aggregate([
            {
              $match: {
                $expr: {
                  $in: ['$_id', ids],
                },
              },
            },
            {
              $lookup: {
                from: 'cables_segments',
                localField: '_id',
                foreignField: 'cable_id',
                as: 'geom',
              },
            },
            {
              $unwind:
                {
                  path: '$geom',
                  preserveNullAndEmptyArrays: false,
                },
            },
            {
              $project: {
                id: 1,
                type: 'Feature',
                properties: {
                  _id: '$_id',
                },
                geometry: '$geom.geometry',

              },
            },
          ]).toArray(async (err, lines) => {
            if (err) return 'Error';
            // we'll going to create the master file for ixps
            // lines = await lines.reduce((total, value) => total.concat(value.geometry), []);
            lines = {
              type: 'FeatureCollection',
              features: lines,
            };
            resolve({ m: 'Loaded', r: lines });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  relationsTransfer() {
    return new Promise((resolve, reject) => {
      const cls = require('../../models/cls.model');
      this.model().then((cables) => {
        cables.aggregate([
          {
            $project: {
              _id: 1,
              cableid: 1,
            },
          },
        ]).toArray((err, ids) => {
          // eslint-disable-next-line import/no-unresolved
          const pool = require('../../config/pgSQL.js');
          ids.map((id) => {
            const SQLQuery = `SELECT id, cable_id, point_id FROM public.cable_points WHERE cable_id = ${id.cableid}`;
            pool.query(SQLQuery, (error, results) => {
              if (results !== undefined) {
                cls()
                  .then(async (cls) => {
                    const list = await results.rows.map((p) => p.point_id);
                    await cls.aggregate([
                      {
                        $match: {
                          cid: { $in: list },
                        },
                      },
                      {
                        $project: {
                          _id: 1,
                        },
                      },
                    ]).toArray(async (err, result) => {
                      const clsids = await result.map((pilot) => new ObjectID(pilot._id));
                      cables.updateOne({ _id: new ObjectID(id._id) }, { $set: { cls: clsids } }, (err, c) => {
                        console.log(c);
                      });
                    });
                    results.rows.map((points) => {
                      cls.updateOne({ cid: points.point_id }, { $addToSet: { cables: new ObjectID(id._id) } }, (err, u) => {
                        console.log(u);
                      });
                    });
                  });
              }
            });

            // ORGS
            const SQLQueryOrg = `SELECT cable_id, org_id FROM cable_org WHERE cable_id = ${id.cableid}`;
            pool.query(SQLQueryOrg, async (error, results) => {
              if (results !== undefined) {
                const orgmodel = require('../../models/organization.model');
                orgmodel().then((org) => {
                  results.rows.map((orgid) => {
                    if (orgid !== null) {
                      org.findOne({ ooid: String(orgid.org_id) }, (err, idorg) => {
                        console.log(idorg);
                        if (idorg !== null && ObjectID.isValid(idorg._id)) {
                          cables.updateOne({ _id: new ObjectID(id._id) }, { $push: { owners: new ObjectID(idorg._id) } }, (err, u) => { // new ObjectID(idorg._id)
                            console.log(id._id);
                          });
                        } else { console.log('Not defined'); }
                      });
                    }
                  });
                });
              }
            });
          });
        });
      }).catch((e) => { reject(e); });
    });
  }

  createBBOXs() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((bboxQuery) => {
          bboxQuery.aggregate([{
            $project: {
              _id: 1,
            },
          }], { allowDiskUse: true }).toArray(async (err, results) => {
            if (err) reject(err);
            else if (results.length !== []) {
              await results.map((element) => {
                this.bbox(element._id).then((bbox) => redisClient.set(`cable_${element._id}`, JSON.stringify(bbox)));
              });
            }
            resolve({ m: 'loaded' });
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  createDATA() {
    return new Promise((resolve, reject) => {
      try {
        console.log('Create data cable');
        this.model().then((bboxQuery) => {
          bboxQuery.aggregate([{
            $project: {
              _id: 1,
            },
          }], { allowDiskUse: true }).toArray(async (err, results) => {
            if (err) reject(err);
            else if (results.length !== []) {
              await results.map((element) => {
                console.log(element._id);
                this.view('', element._id);
              });
            }
            resolve({ m: 'loaded' });
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  checkName(name) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((search) => {
          search.find({ name }).count((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        });
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  subSealistByName(res, req) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cables) => {
          cables.aggregate([{ $project: { name: 1, terrestrial: 1 } }, { $match: { terrestrial: false } }]).toArray(async (err, r) => {
            if (err) res.sendStatus(500);
            res.json(await r.map((x) => x.name ));
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }

  // owner(id) {
  //   return new Promise((resolve, reject) => {
  //     // eslint-disable-next-line no-empty
  //     try {
  //       this.model().then((owner) => {
  //         owner.aggregate([{ $project: { _id: 1, uuid: 1 } }, { $match: { _id: new ObjectId(id)}}]).toArray((err, r) => {
  //           if (err) reject(err);
  //           resolve(r.[0].uuid)
  //         });
  //       });
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }
}
module.exports = Cable;
