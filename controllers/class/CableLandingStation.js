const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');
const { adms } = require('../helpers/adms');

class CLS {
  constructor() {
    this.model = require('../../models/cls.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cls) => {
            // TODO: check if exist another cls with the same name
            data = {
              uuid: String(user),
              name: data.name,
              notes: '', // String(data.notes)
              state: data.state,
              slug: data.slug,
              geom: (data.geom !== '') ? JSON.parse(data.geom) : {},
              cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
              tags: data.tags,
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            cls.find({ name: data.name }).count((err, c) => {
              if (err) reject({ m: err + 0 });
              else if (c > 0) reject({ m: 'We have another element with the same name' });
              cls.insertOne(data, (err, i) => {
                // TODO: validation insert
                if (err) reject({ m: err });
                resolve({ m: 'CLS created' });
              });
            });
          }).catch((e) => { console.log(e); reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        if (GJV.valid(JSON.parse(data.point))) {
          this.model().then((cls) => {
            cls.find({ cid: String(data.cid) }).count(async (err, c) => {
              if (err) resolve({ m: err });
              else if (c > 0) resolve({ m: 'We have registered in our system more than one organization with the same name' });
              else {
                data = {
                  uuid: '',
                  cid: String(data.cid),
                  name: String(data.name),
                  notes: '', // String(data.notes)
                  state: `${String(data.state)}`,
                  slug: `${String(data.slug)}`,
                  geom: {
                    type: 'FeatureCollection',
                    features: [
                      {
                        type: 'Feature',
                        properties: {},
                        geometry: JSON.parse(data.point),
                      },
                    ],
                  },
                  cables: [],
                  tags: [],
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: false,
                  deleted: false,
                };
                // we need search about the information
                cls.insertOne(data, (err, i) => {
                  if (err) resolve({ m: err + 0 });
                  resolve();
                });
              }
            });
          }).catch((e) => reject({ m: e + 1 }));
        }
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cls) => {
            const id = new ObjectID(data._id);
            // we need to validate if  don't have another organization with the same name
            cls.find({
              $and:
                 [{ _id: { $ne: id } }, { name: String(data.name) }],
            }).count(async (err, c) => {
              // if (err) reject({ m: err });
              // else if (c > 0) reject({ m: 'We have registered in our system more than one cls with the same name' });
              // else {
              //
              // }
              // TODO: validate the numbers of cls with the same name
              data = {
                name: data.name,
                state: data.state,
                slug: data.slug,
                geom: (data.geom !== '') ? JSON.parse(data.geom) : {},
                cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
                tags: data.tags,
                uDate: luxon.DateTime.utc(),
              };
              cls.updateOne(
                { $and: [adms(user), { _id: id }] }, { $set: data }, (err, u) => {
                  if (err) reject(err);
                  else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
                  else resolve({ m: 'CLS updated', r: data });
                },
              );
            });
          }).catch((e) => reject(e));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  updateCable(user, idcls, idcable) {
    return new Promise((resolve, reject) => {
      try {
        if (ObjectID.isValid(idcls) && ObjectID.isValid(idcable)) {
          this.model().then((cls) => {
            cls.updateOne({
              _id: new ObjectID(idcls),
            }, { $addToSet: { cables: new ObjectID(idcable) } }, (err, u) => {
              if (err) reject(err);
              else if (u.ok !== 1) resolve({ m: 'Not updated' });
              else resolve({ m: 'Updated' });
            });
          });
        } else reject({ m: 'Not resolved' });
      } catch (e) { reject({ m: e }); }
    });
  }

  removeCable(user, idcls, idcable) {
    return new Promise((resolve, reject) => {
      try {
        if (ObjectID.isValid(idcls) && ObjectID.isValid(idcable)) {
          this.model().then((cls) => {
            cls.updateOne({
              _id: new ObjectID(idcls),
            }, { $pull: { cables: new ObjectID(idcable) } }, (err, u) => {
              if (err) reject(err);
              else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your cls' });
              else resolve({ m: 'Updated' });
            });
          });
        } else reject({ m: 'Not resolved' });
      } catch (e) { reject({ m: e }); }
    });
  }

  listOfCables(user, idcls) {
    return new Promise((resolve, reject) => {
      try {
        if (ObjectID.isValid(idcls)) {
          this.model().then((cls) => {
            cls.aggregate([
              {
                $match: {
                  $and: [
                    { _id: new ObjectID(idcls) },
                  ],
                },
              },
              {
                $lookup: {
                  from: 'cables',
                  let: { cables: '$cables' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ['$_id', '$$cables'],
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
                  as: 'cables',
                },
              },
              { $unwind: { path: '$cables', preserveNullAndEmptyArrays: false } },
              {
                $project: {
                  _id: '$cables._id',
                  value: '$cables.name',
                },
              }]).toArray((err, rNetwork) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rNetwork });
            });
          });
        } else reject({ m: 'Not resolved' });
      } catch (e) { reject({ m: e }); }
    });
  }

  listOfCLSbyCable(user, idCable) {
    return new Promise((resolve, reject) => {
      try {
        if (ObjectID.isValid(idCable)) {
          this.model().then((cls) => {
            cls.aggregate([
              {
                $addFields: {
                  cables: {
                    $cond: {
                      if: { $eq: [{ $type: '$cables' }, 'array'] },
                      then: '$cables',
                      else: [],
                    },
                  },
                },
              },
              {
                $match: {
                  $expr: {
                    $in: [new ObjectID(idCable), '$cables'],
                  },
                },
              },
              { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
              {
                $project: {
                  _id: 1,
                  yours: 1,
                  name: 1,
                },
              },
            ]).toArray((err, rNetwork) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rNetwork });
            });
          });
        } else reject({ m: 'Not resolved' });
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user, page) {
    console.log(page);
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((cls) => {
            cls.aggregate([
              {
                $sort: { _id: 1 },
              }, {
                $match: {
                  $and: [
                    adms(user),
                    { deleted: false },
                  ],
                },
              },
              { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
              { $limit: limit },
              //   {
              //   $lookup: {
              //     from: 'cables',
              //     let: { cables: '$cables' },
              //     pipeline: [
              //       {
              //         $match: {
              //           $expr: {
              //             $in: ['$_id', '$$cables'],
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
              //     as: 'cables',
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
                  deleted: 0,
                },
              }]).toArray((err, rNetwork) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rNetwork });
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
          this.model().then(async (cls) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            cls.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your CLS' });
              else {
                cls.updateOne(
                  { $and: [adms(user), { _id: id }] }, { $set: { deleted: true, uDate: luxon.DateTime.utc() } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your cls' });
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
            ]).toArray((err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o[0] });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  bbox(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cls) => {
          cls.aggregate([
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
              $project: {
                _id: 1,
                coordinates: [{ $arrayElemAt: ['$v', 0] }, { $arrayElemAt: ['$b', -1] }],
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
        const uuid = (search.psz === '1') ? adms(user) : {};
        this.model().then((cable) => {
          cable.aggregate([
            {
              $match: { $and: [uuid, { name: { $regex: search.s, $options: 'i' } }, { deleted: false }] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $project: {
                _id: 1,
                name: 1,
                yours: 1,
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

  view(user, id) {
    return new Promise((resolve, reject) => {
      try {
        redisClient.redisClient.get(`v_cls_${id}`, (err, reply) => {
          if (err) reject({ m: err });
          else if (reply) resolve(((JSON.parse(reply))));
          else {
            this.model().then((cls) => {
              cls.aggregate([
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
                    from: 'cables',
                    let: { cables: '$cables' },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$cables'],
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
                    as: 'cables',
                  },
                },
                {
                  $lookup: {
                    from: 'networks',
                    let: { cls: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$$cls', '$cls'],
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
                        $addFields: {
                          norgs: { $size: '$idsorgs' },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', { $cond: { if: { $eq: ['$norgs', 0] }, then: [], else: { $arrayElemAt: ['$idsorgs', 0] } } }],
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
                    from: 'alerts',
                    let: { elemnt: { $toString: '$_id' } },
                    pipeline: [
                      {
                        $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '2' }, { uuid: user }, { disabled: false }] },
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
                redisClient.set(`v_cls_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
                resolve({ m: 'Loaded', r: c });
              });
            });
          }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  getElementGeom(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cls) => {
          cls.aggregate([
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
        this.model().then((cls) => {
          cls.aggregate([
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
          ]).toArray(async (err, points) => {
            if (err) return 'Error';
            // we'll going to create the master file for ixps
            points = await points.reduce((total, value) => total.concat(value.geom.features), []);
            points = {
              type: 'FeatureCollection',
              features: points,
            };
            resolve({ m: 'Loaded', r: points });
          });
        });
      } catch (e) { reject({ m: e }); }
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
                this.bbox(element._id).then((bbox) => redisClient.set(`cls_${element._id}`, JSON.stringify(bbox)));
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
}
module.exports = CLS;
