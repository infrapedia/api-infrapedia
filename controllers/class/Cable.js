const luxon = require('luxon');
const GJV = require('geojson-validation');
const fs = require('fs');
const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');
// const geojsonHint = require('@mapbox/geojsonhint');
const slugToString = require('../helpers/slug');

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
                // const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
                data = {
                  uuid: String(user),
                  name: String(data.name),
                  slug: slugToString(data.name),
                  // cc: String(data.cc),
                  notes: '', // String(data.notes)
                  systemLength: String(data.systemLength),
                  activationDateTime: (data.activationDateTime) ? luxon.DateTime.fromJSDate(new Date(data.activationDateTime)).toUTC() : luxon.DateTime.fromJSDate(new Date()).toUTC(),
                  urls: (Array.isArray(data.urls)) ? data.urls : [],
                  terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
                  capacityTBPS: String(data.capacityTBPS),
                  litCapacity: await (Array.isArray(data.litCapacity)) ? data.litCapacity.map((item) => JSON.parse(item)) : [],
                  fiberPairs: String(data.fiberPairs),
                  category: String(data.category),
                  facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                  owners: await (Array.isArray(data.owners)) ? data.owners.map((item) => new ObjectID(item)) : [],
                  knownUsers: await (Array.isArray(data.knownUsers)) ? data.knownUsers.map((item) => new ObjectID(item)) : [],
                  cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
                  geom: {}, // (geomData !== '') ? JSON.parse(geomData) : {}
                  tags: data.tags,
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: false,
                  deleted: false,
                };
                let listSegments = JSON.parse(geomData);
                cables.find({ name: data.name }, async (err, c) => {
                  if (err) reject({ m: err + 0 });
                  else if (c.length > 0 && c._id !== data._id) reject({ m: 'We have another element with the same name' });

                  cables.insertOne(data, async (err, i) => {
                    // TODO: validation insert
                    if (err) reject({ m: err + 0 });
                    //
                    // if (Array.isArray(data.cls)) {
                    //   let cableLandingStation = require('./CableLandingStation');
                    //   cableLandingStation = new cableLandingStation();
                    //   await data.cls.map((c) => {
                    //     cableLandingStation.updateCable(user, c, i.insertedId).then((r) => '').catch((e) => '');
                    //   });
                    // }
                    // we going to update the segments

                    await data.cls.map((cls) => this.updateCLSConnection(cls, i.insertedId));
                    await data.facilities.map((facility) => this.updateFacilityConnection(facility, i.insertedId, (data.terrestrial === 'True' || data.terrestrial === 'true') ? 't' : 's'));
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
                          if (ssafe === listSegments.length) {
                            fs.unlink(`./temp/${nameFile}.json`, (err) => {
                              resolve({ m: 'Cable created', r: i.insertedId });
                            });
                          }
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
      } catch (e) { console.log(e); reject({ m: e + 2 }); }
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
              const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
              data = {
                uuid: '',
                cableid: String(data.cableid),
                name: String(data.name),
                slug: slugToString(data.name),
                notes: '', // String(data.notes)
                systemLength: String(data.systemLength),
                activationDateTime: (data.activationDateTime) ? luxon.DateTime.fromJSDate(new Date(data.activationDateTime)).toUTC() : luxon.DateTime.fromJSDate(new Date()).toUTC(),
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


  updateCLSConnection(idCls, idCable) {
    try {
      const cls = require('../../models/cls.model');
      cls().then((cls) => {
        cls.updateOne({ _id: new ObjectID(idCls) }, { $addToSet: { cables: idCable } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 1';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  updateFacilityConnection(idFacility, idCable, subseaOrTerrestrial) {
    try {
      const facility = require('../../models/facility.model');
      facility().then((facility) => {
        const query = (subseaOrTerrestrial === 's') ? { $addToSet: { subsea: idCable } } : { $addToSet: { terrestrials: idCable } };
        facility.updateOne({ _id: new ObjectID(idFacility) }, query, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 1';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  removeFacilityConnection(idFacility, idCable, subseaOrTerrestrial) {
    try {
      const facility = require('../../models/facility.model');
      facility().then((facility) => {
        const query = (subseaOrTerrestrial === 's') ? { $pull: { subsea: idCable } } : { $pull: { terrestrials: idCable } };
        facility.updateOne({ _id: new ObjectID(idFacility) }, query, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 1';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  removeCLSConnection(idCls, idCable) {
    try {
      const cls = require('../../models/cls.model');
      cls().then((cls) => {
        cls.updateOne({ _id: new ObjectID(idCls) }, { $pull: { cables: idCable } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 2';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cables) => {
            const nameFile = Math.floor(Date.now() / 1000);
            const stream = await fs.createWriteStream(`./temp/${nameFile}.json`);
            stream.on('error', (err) => {
              reject({ m: err });
            });
            stream.write(data.geom);
            stream.end(async () => {
              const geomData = await fs.readFileSync(`./temp/${nameFile}.json`, 'utf8');
              const id = new ObjectID(data._id);
              const idUpdate = data._id;
              const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
              const cls = (Array.isArray(data.cls)) ? data.cls : [];

              // console.log(data.facilities);

              data = {
                uuid: String(user),
                name: String(data.name),
                slug: slugToString(data.name),
                // cc: String(data.cc),
                systemLength: String(data.systemLength),
                activationDateTime: (data.activationDateTime) ? luxon.DateTime.fromJSDate(new Date(data.activationDateTime)).toUTC() : luxon.DateTime.fromJSDate(new Date()).toUTC(),
                urls: (data.urls !== '') ? data.urls : [],
                terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
                capacityTBPS: String(data.capacityTBPS),
                litCapacity: await (Array.isArray(data.litCapacity)) ? data.litCapacity.map((item) => JSON.parse(item)) : [],
                fiberPairs: String(data.fiberPairs),
                // notes: String(data.notes),
                category: String(data.category),
                facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                owners: await (Array.isArray(data.owners)) ? data.owners.map((item) => new ObjectID(item)) : [],
                knownUsers: await (Array.isArray(data.knownUsers)) ? data.knownUsers.map((item) => new ObjectID(item)) : [],
                cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
                geom: {}, // (geomData !== '') ? JSON.parse(geomData) : {},
                tags: data.tags,
                uDate: luxon.DateTime.utc(),
              };
              // we're going to search if the user is the own of the cable
              let listSegments = JSON.parse(geomData);
              cables.findOne({ $and: [adms(user), { _id: id }] }, async (err, c) => {
                // Founds CLS
                c.cls = await c.cls.map((cls) => String(cls));
                const clsNotFounds = await (Array.isArray(data.cls) && c.cls !== undefined) ? c.cls.filter((f) => !data.cls.includes(f)) : [];
                await data.cls.map((cls) => this.updateCLSConnection(cls, id));
                await clsNotFounds.map((cls) => this.removeCLSConnection(cls, id));
                // Founds cables
                c.facilities = await c.facilities.map((facility) => String(facility));
                const facilitiesNotFounds = await (Array.isArray(data.facilities) && c.facilities !== undefined) ? c.facilities.filter((f) => !data.facilities.includes(f)) : [];
                await facilitiesNotFounds.map((facility) => this.removeFacilityConnection(facility, id, (c.terrestrial) ? 't' : 's'));
                await data.facilities.map((facility) => this.updateFacilityConnection(facility, id, (c.terrestrial) ? 't' : 's'));

                if (err) reject({ m: err });
                const segments = require('../../models/cable_segments.model');
                segments().then(async (segments) => {
                  segments.deleteMany({ cable_id: id }, (err, d) => {
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
                            if (ssafe === listSegments.length) {
                              fs.unlink(`./temp/${nameFile}.json`, (err) => {
                                resolve({ m: 'Cable updated' });
                              });
                            }
                          });
                        });
                      }
                    });
                  });
                });
              });
            });
          }).catch((e) => { console.log(e); reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { console.log(e); reject({ m: e }); }
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
                    // { deleted: false },
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
                    // { deleted: false },
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
                    $project: { _id: 1, name: 1 },
                  },
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
                          deleted: { $ne: true },
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      label: '$name',
                    },
                  },
                  { $sort: { name: 1 } },
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
                    $project: { _id: 1, name: 1 },
                  },
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
                  { $sort: { label: 1 } },
                ],
                as: 'owners',
              },
            },
            {
              $lookup: {
                from: 'organizations',
                let: { f: '$knownUsers' },
                pipeline: [
                  {
                    $project: { _id: 1, name: 1 },
                  },
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
                  { $sort: { label: 1 } },
                ],
                as: 'knownUsers',
              },
            },
            {
              $lookup: {
                from: 'cls',
                let: { f: '$cls' },
                pipeline: [
                  {
                    $project: { _id: 1, name: 1, country: 1 },
                  },
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
                    $addFields: {
                      country: { $cond: [{ $ne: ['$country', ''] }, { $concat: [',', '$country'] }, ''] },
                    },
                  },
                  {
                    $addFields: {
                      name: { $concat: ['$name', { $ifNull: ['$country', ''] }] },
                    },
                  },
                  {
                    $project: {
                      label: '$name',
                    },
                  },
                  { $sort: { label: 1 } },
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
            {
              $addFields: {
                'properties._id': '$_id',
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
            if (r[0][0] !== undefined) {
              r[0][0].geom = {
                type: 'FeatureCollection',
                features: r[1],
              };
              resolve({
                m: 'Loaded',
                r: r[0][0],
              });
            } else {
              reject({ m: 'Not found' });
            }
          }).catch((e) => { console.log(e); reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  getBoundsCoords(coords) {
    return new Promise((resolve, reject) => {
      try {
        const reduceCoords = [];
        for (let i = 0; i <= coords.length; ++i) {
          if (i === coords.length) {
            resolve(reduceCoords);
          } else if (coords[i] !== undefined) {
            for (let j = 0; j < coords[i].length; ++j) {
              if (coords[i].length === 2){
                reduceCoords.push(coords[i]);
              } else {
                reduceCoords.push(coords[i][j]);
              }

            }
          }
        }
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
                  if( id == '61e8b51612b8ed7497b00a75'){
                    console.log( '-------- Validating-------', id, [Array.isArray(r[0]) ? (Array.isArray(r[0][0])) ? r[0][0][0]: r[0], (Array.isArray(r[r.length - 1])) ? (Array.isArray(r[r.length - 1][0])) ? r[r.length - 1][0][0] : r[r.length - 1][0] : r[r.length - 1] ])
                  }
                  resolve({ m: 'Loaded', 
                           r: [Array.isArray(r[0]) ? (Array.isArray(r[0][0])) ? r[0][0][0]: r[0], (Array.isArray(r[r.length - 1])) ? (Array.isArray(r[r.length - 1][0])) ? r[r.length - 1][0][0] : r[r.length - 1][0] : r[r.length - 1] ]
                           // [r[0], r[r.length - 1]] 
                          });
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
        this.model = require('../../models/cable.model');
        this.model().then((cable) => {
          const uuid = (search.psz === '1') ? adms(user) : {};
          cable.aggregate([
            {
              $project: {
                _id: 1,
                uuid: 1,
                name: 1,
                terrestrial: 1,
                yours: 1,
                alerts: 1,
                deleted: 1,
                rgDate: 1,
                uDate: 1,
              },
            },
            {
              $match: {
                $and: [
                  uuid,
                  { name: { $regex: search.s, $options: 'i' } },
                  (String(search.psz) !== '1') ? { deleted: { $ne: true } } : {},
                ],
              },
            },
            // {
            //   $match: { $and: [{ name: { $regex: search.s.toLowerCase(), $options: 'i' } }, uuid, { deleted: { $ne: true } }] }, // , uuid, { deleted: { $ne: true } } { $and: [uuid, , { deleted: false }] },
            // },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            { $sort: { slug: 1 } },
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
        let sortBy = {};
        const limit = 40;
        const page = (search.page) ? search.page : 0;
        if (search.sortBy !== undefined || search.sortBy !== '') {
          // eslint-disable-next-line no-unused-vars
          switch (search.sortBy) {
            case 'nameAsc':
              sortBy = { slug: 1 };
              break;
            case 'nameDesc':
              sortBy = { slug: -1 };
              break;
            case 'creatAtAsc':
              sortBy = { rgDate: 1 };
              break;
            case 'creatAtDesc':
              sortBy = { rgDate: -1 };
              break;
            case 'updateAtAsc':
              sortBy = { uDate: 1 };
              break;
            case 'updateAtDesc':
              sortBy = { uDate: -1 };
              break;
            default:
              sortBy = { slug: 1 };
              break;
          }
        } else { sortBy = { slug: 1 }; }

        this.model().then((cable) => {
          cable.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
                terrestrial: 1,
                yours: 1,
                alerts: 1,
                deleted: 1,
                rgDate: 1,
                uDate: 1,
              },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s.toLowerCase(), $options: 'i' } }, { terrestrial: true }, (String(search.psz) !== '1') ? { deleted: { $ne: true } } : {}] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $sort: sortBy,
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
            { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
            { $limit: limit },
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
        let sortBy = {};
        const limit = 40;
        const page = (search.page) ? search.page : 0;
        if (search.sortBy !== undefined || search.sortBy !== '') {
          // eslint-disable-next-line no-unused-vars
          switch (search.sortBy) {
            case 'nameAsc':
              sortBy = { slug: 1 };
              break;
            case 'nameDesc':
              sortBy = { slug: -1 };
              break;
            case 'creatAtAsc':
              sortBy = { rgDate: 1 };
              break;
            case 'creatAtDesc':
              sortBy = { rgDate: -1 };
              break;
            case 'updateAtAsc':
              sortBy = { uDate: 1 };
              break;
            case 'updateAtDesc':
              sortBy = { uDate: -1 };
              break;
            case 'rfsAsc':
              sortBy = { activationDateTime: 1 };
              break;
            case 'rfsDesc':
              sortBy = { activationDateTime: -1 };
              break;
            default:
              sortBy = { slug: 1 };
              break;
          }
        } else { sortBy = { slug: 1 }; }
        this.model().then((cable) => {
          cable.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
                terrestrial: 1,
                activationDateTime: 1,
                yours: 1,
                alerts: 1,
                rgDate: 1,
                uDate: 1,
                deleted: 1,
              },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s.toLowerCase(), $options: 'i' } }, { terrestrial: false }, (String(search.psz) !== '1') ? { deleted: { $ne: true } } : {}] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $sort: sortBy,
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
            { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
            { $limit: limit },
          ]).toArray((err, r) => {
            // console.log(r);
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  view(user, id) {
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
              $project: { geom: 0 },
            },
            {
              $lookup: {
                from: 'facilities',
                let: { f: '$facilities' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      point: 1,
                    },
                  },
                  {
                    $addFields: {
                      f: {
                        $cond: {
                          if: { $eq: [{ $type: '$$f' }, 'array'] },
                          then: '$$f',
                          else: [],
                        },
                      },
                      point: { $ifNull: ['$point', {}] },
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$f'],
                          },
                        },
                        {
                          point: { $ne: {} },
                        },
                        {
                          deleted: { $ne: true },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      elmnt: {
                        type: 'Feature',
                        properties: { name: '$name', id: { $toString: '$_id' }, _id: { $toString: '$_id' } },
                        geometry: '$point',
                      },
                    },
                  },
                  {
                    $project: { elmnt: 1 },
                  },
                ],
                as: 'facsElements',
              },
            },
            {
              $lookup: {
                from: 'cls',
                let: { f: '$cls' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      geom: 1,
                    },
                  },
                  {
                    $addFields: {
                      f: {
                        $cond: {
                          if: { $eq: [{ $type: '$$f' }, 'array'] },
                          then: '$$f',
                          else: [],
                        },
                      },
                      geom: { $ifNull: ['$geom', {}] },
                    },
                  },
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$f'],
                          },
                        },
                        {
                          geom: { $ne: {} },
                        },
                        {
                          deleted: { $ne: true },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: '$geom.features',
                  },
                  {
                    $addFields: {
                      elmnt: {
                        type: 'Feature',
                        properties: { name: '$name', id: { $toString: '$_id' }, _id: { $toString: '$_id' } },
                        geometry: '$geom.features.geometry',
                      },
                    },
                  },
                  {
                    $project: { elmnt: 1 },
                  },
                ],
                as: 'clsElements',
              },
            },
            {
              $addFields: {
                clusterRelations: { $concatArrays: ['$facsElements.elmnt', '$clsElements.elmnt'] },
              },
            },
            {
              $addFields: {
                cluster: {
                  type: 'FeatureCollection',
                  features: '$clusterRelations',
                },
              },
            },
            {
              $lookup: {
                from: 'facilities',
                let: { f: '$facilities' },
                pipeline: [
                  {
                    $project: { _id: 1, name: 1 },
                  },
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
                          deleted: { $ne: true },
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
                  { $sort: { name: 1 } },
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
                    $project: { _id: 1, name: 1, country: 1 },
                  },
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
                          deleted: { $ne: true },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      name: { $concat: ['$name', ', ', { $ifNull: ['$country', ''] }] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                  { $sort: { name: 1 } },
                ],
                as: 'cls',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: { f: '$_id' },
                pipeline: [
                  {
                    $project: { _id: 1, name: 1 },
                  },
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
                          deleted: { $ne: true },
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
                  { $sort: { name: 1 } },
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
                    $project: { _id: 1, name: 1 },
                  },
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
                          deleted: { $ne: true },
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
                  { $sort: { name: 1 } },
                ],
                as: 'organizations',
              },
            },
            {
              $lookup: {
                from: 'organizations',
                let: { f: '$knownUsers' },
                pipeline: [
                  {
                    $project: { _id: 1, name: 1 },
                  },
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
                      name: '$name',
                    },
                  },
                  { $sort: { label: 1 } },
                ],
                as: 'knownUsers',
              },
            },
            {
              $lookup: {
                from: 'organizations',
                let: { f: '$owners' },
                pipeline: [
                  {
                    $project: { _id: 1, name: 1 },
                  },
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
                      name: 1,
                    },
                  },
                  { $sort: { name: 1 } },
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
                activationDateTime: { $cond: [{ $eq: ['$activationDateTime', ''] }, '$currentDate', '$activationDateTime'] },
                RFS: {
                  $let: {
                    vars: {
                      monthsInString: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    },
                    in: {
                      $arrayElemAt: ['$$monthsInString', { $month: { $toDate: '$activationDateTime' } }],
                    },
                  },
                },
              },
            },
            {
              $addFields: {
                // RFS: {
                //   $cond: [
                //     { $ne: ['', '$activationDateTime'] },
                //     {
                //       $concat: [
                //         ' (',
                //         {
                //           $cond: [
                //             { $lte: [{ $month: { $toDate: '$activationDateTime' } }, 3] },
                //             'Q1',
                //             {
                // eslint-disable-next-line max-len
                //               $cond: [{ lte: [{ $month: { $toDate: '$activationDateTime' } }, 6] },
                //                 'Q2',
                //                 {
                //                   $cond: [{ $lte: [{ $month: { $toDate: '$activationDateTime' } }, 9] },
                //                     'Q3',
                //                     'Q4',
                //                   ],
                //                 },
                //               ],
                //             },
                //           ],
                //         }, ') ',
                //         { $toString: { $month: { $toDate: '$activationDateTime' } } },
                //         '-',
                //         { $toString: { $sum: [{ $year: { $toDate: '$activationDateTime' } }, 0] } },
                //       ],
                //     },
                //     '',
                //   ],
                // },
                RFS: {
                  $concat: ['$RFS', ' ', { $toString: { $sum: [{ $year: { $toDate: '$activationDateTime' } }, 0] } }],
                },
              },
            },
            {
              $project: {
                geom: 0,
                status: 0,
                deleted: 0,
                facsElements: 0,
                clsElements: 0,
                clusterRelations: 0,
              },
            },
          ]).toArray((err, c) => {
            if (err) reject(err);
            redisClient.set(`v_cable_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
            resolve({ m: 'Loaded', r: c });
          });
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
              const i = 0;
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
        this.model().then((bboxQuery) => {
          bboxQuery.aggregate([{
            $project: {
              _id: 1,
            },
          }], { allowDiskUse: true }).toArray(async (err, results) => {
            if (err) reject(err);
            else if (results.length !== []) {
              await results.map((element) => {
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
          search.aggregate([
            {
              $project: {
                name: 1,
              },
            },
            {
              $addFields: {
                name: { $toLower: '$name' },
              },
            },
            {
              $match: {
                name: name.toLowerCase(),
              },
            },
          ]).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c.length });
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
            res.json(await r.map((x) => x.name));
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }

  permanentDelete(usr, id, code) {
    return new Promise((resolve, reject) => {
      try {
        if (Object.keys(adms(usr)).length === 0) {
          if (true) { // code === process.env.securityCode
            this.model().then((element) => {
              element.deleteOne({ _id: new ObjectID(id), deleted: true }, (err, result) => {
                if (err) reject({ m: err });
                resolve({ m: 'Element deleted' });
              });
            });
          } else {
            reject({ m: 'Permissions denied' });
          }
        } else {
          reject({ m: 'Permissions denied' });
        }
      } catch (e) { reject({ m: e }); }
    });
  }

  getIdBySlug(slug) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((elemnt) => {
          elemnt.findOne({ slug }, (err, r) => {
            if (err) reject({ m: err });
            resolve({ m: '', r: (r._id) ? r._id : '' });
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
