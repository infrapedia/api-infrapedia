const luxon = require('luxon');
const GJV = require('geojson-validation');
const fs = require('fs');
// const geojsonHint = require('@mapbox/geojsonhint');

const { ObjectID } = require('mongodb');
const { adms } = require('../helpers/adms');

let segmentsCounts = 0;

class Cable {
  constructor() {
    this.model = require('../../models/cable.model');
  }

  segments(user, data) {
    return new Promise((resolve) => {
      try {
        const segment = {

        };
      } catch (e) { resolve(e); }
    });
  }

  add(user, data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
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
                geom: {}, // (geomData !== '') ? JSON.parse(geomData) : {}
                tags: data.tags,
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
                status: false,
                deleted: false,
              };
              let listSegments = JSON.parse(geomData);
              cables.insertOne(data, (err, i) => {
                // TODO: validation insert
                if (err) reject({ m: err + 0 });
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
                        resolve({ m: 'Cable created' });
                      });
                    });
                  });
                }).catch((e) => {
                  reject({ m: 'error saving segments' });
                });
              });
            });
          }).catch((e) => reject({ m: e + 1 }));
        } else { resolve('Not user found'); }
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
              // const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
              console.log(String(data.cableid));
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
              const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
              data = {
                uuid: String(user),
                name: String(data.name),
                // cc: String(data.cc),
                systemLength: String(data.systemLength),
                activationDateTime: (activationDateTime !== '') ? luxon.DateTime.fromJSDate(activationDateTime).toUTC() : '',
                urls: (data.urls === '') ? data.urls : [],
                terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
                capacityTBPS: String(data.capacityTBPS),
                litCapacity: await (Array.isArray(data.litCapacity)) ? data.litCapacity.map((item) => JSON.parse(item)) : [],
                fiberPairs: String(data.fiberPairs),
                // notes: String(data.notes),
                category: String(data.category),
                facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                owners: await (Array.isArray(data.owners)) ? data.owners.map((item) => new ObjectID(item)) : [],
                geom: {},// (geomData !== '') ? JSON.parse(geomData) : {},
                tags: data.tags,
                uDate: luxon.DateTime.utc(),
              };
              // we're going to search if the user is the own of the cable
              let listSegments = JSON.parse(geomData);
              cables.find({ _id: id, uuid: String(user) }).count((err, c) => {
                if (err) reject({ m: err });
                const segments = require('../../models/cable_segments.model');
                segments().then(async (segments) => {
                  segments.remove({ cable_id: id }, (err, d) => {
                    if (err) reject({ m: err });
                    cables.updateOne({ _id: id, uuid: String(user) }, { $set: data }, async (err, u) => {
                      if (err) reject({ m: err });
                      else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
                      else {
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
                $sort: { _id: 1 },
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
                $sort: { _id: 1 },
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

  shortList(user) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((cables) => {
            cables.aggregate([{
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
                  { _id: id, uuid: String(user) }, { $set: { deleted: true } }, (err, u) => {
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

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((cables) => {
            id = new ObjectID(id);
            cables.aggregate([
              {
                $match: {
                  _id: id,
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
                          $in: ['$_id', '$$f'],
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
                              $in: ['$_id', '$$f'],
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
            ]).toArray((err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o[0] });
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  bbox(user, id) {
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
              $addFields: {
                coordinates: { $map: { input: '$geom.features.geometry.coordinates', as: 'feature', in: '$$feature' } },
              },
            },
            {
              $addFields: {
                v: { $arrayElemAt: ['$geom.features.geometry.coordinates', 0] },
                b: { $arrayElemAt: ['$geom.features.geometry.coordinates', -1] },
              },
            },
            {
              $addFields: {
                position: { $toInt: { $divide: [{ $size: { $arrayElemAt: ['$v', 0] } }, 2] } },
              },
            },
            {
              $project: {
                _id: 1,
                coordinates: { $cond: { if: { $eq: [{ $size: '$v' }, 0] }, then: { $arrayElemAt: [{ $arrayElemAt: ['$v', 0] }, '$position'] }, else: { $arrayElemAt: ['$b', -1] } } },
              },
            },
          ]).toArray((err, c) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r: c });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  search(user, search) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cable) => {
          cable.aggregate([
            {
              $match: { name: { $regex: search, $options: 'i' } },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $project: {
                _id: 1,
                name: 1,
                terrestrial: 1,
                yours: 1,
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
                                if: { $isArray: { $arrayElemAt: ['$$f', 0] } },
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
                let: { cables: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$$cables', '$cables'],
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
                as: 'cls',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: { cable: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$$cable', '$cables'],
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
                            $in: ['$_id', '$$f'],
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
              $project: {
                geom: 0,
                status: 0,
                deleted: 0,
              },
            },
          ]).toArray((err, c) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r: c });
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
        if (!Array.isArray(ids) || ids.length === 0) resolve({ m: 'Loaded', r: false });
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
              $project: {
                geom: 1,
              },
            },
          ]).toArray(async (err, lines) => {
            if (err) return 'Error';
            // we'll going to create the master file for ixps
            lines = await lines.reduce((total, value) => total.concat(value.geom.features), []);
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
            pool.query(SQLQuery, async (error, results) => {
              if (results !== undefined) {
                cls().then((cls) => {
                  results.rows.map((points) => {
                    // checkIds.push({ _id: ObjectId("5e79b3899db3570f49c267cc") }points.point_id);
                    // search the cls
                    console.log('CLS', points.point_id);
                    cls.updateOne({ cid: points.point_id }, { $push: { cables: new ObjectID(id._id) } }, (err, u) => { // new ObjectID(id.cableid) { $push: { cables: new ObjectID(id._id) } }
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
                            console.log(u);
                          });
                        } else { console.log('Not defined'); }
                      });
                      // });
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
}
module.exports = Cable;
