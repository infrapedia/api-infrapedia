const luxon = require('luxon');
const GJV = require('geojson-validation');
const redisClient = require('../../config/redis');
const { ObjectID } = require('mongodb');
const countries = require('../helpers/isoCountries');

const { adms } = require('../helpers/adms');

let transfer = 0;
const repeat = 0;
class IXP {
  constructor() { this.model = require('../../models/ixp.model'); }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (ixps) => {
          if (data) {
            const geom = JSON.parse(data.geom);
            const element = {
              name: String(data.name),
              nameLong: String(data.nameLong),
              geom: geom.features[0].geom,
              media: String(data.media),
              policyEmail: String(data.policyEmail),
              policyPhone: String(data.policyPhone),
              proto_ipv6: (data.proto_ipv6 === 'true' || data.proto_ipv6 === 'True' || data.proto_ipv6 === true),
              proto_multicast: (data.proto_multicast === 'true' || data.proto_multicast === 'True' || data.proto_multicast === true),
              proto_unicast: (data.proto_unicast === 'true' || data.proto_unicast === 'True' || data.proto_unicast === true),
              techEmail: String(data.techEmail),
              techPhone: String(data.techPhone),
              tags: data.tags,
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            ixps.insertOne(element, (err, f) => {
              if (err) reject({ m: err + 0 });
              resolve({ m: 'Facility created' });
            });
          } else { reject({ m: 'Error' }); }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (ixps) => {
          if (data) {
            const geom = JSON.parse(data.geom);
            const element = {
              name: String(data.name),
              nameLong: String(data.nameLong),
              geom: geom.features[0].geom,
              media: String(data.media),
              policyEmail: String(data.policyEmail),
              policyPhone: String(data.policyPhone),
              proto_ipv6: (data.proto_ipv6 === 'true' || data.proto_ipv6 === 'True' || data.proto_ipv6 === true),
              proto_multicast: (data.proto_multicast === 'true' || data.proto_multicast === 'True' || data.proto_multicast === true),
              proto_unicast: (data.proto_unicast === 'true' || data.proto_unicast === 'True' || data.proto_unicast === true),
              techEmail: String(data.techEmail),
              techPhone: String(data.techPhone),
              tags: data.tags,
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            ixps.updateOne({ _id: new ObjectID(data._id) }, { $set: element }, (err, f) => {
              if (err) reject({ m: err + 0 });
              resolve({ m: 'Facility created' });
            });
          } else { reject({ m: 'Error' }); }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((ixps) => {
            ixps.aggregate([
              {
                $project: {
                  name: 1,
                  nameLong: 1,
                  ix_id: 1,
                  proto_ipv6: 1,
                  proto_multicast: 1,
                  proto_unicast: 1,
                  techEmail: 1,
                  techPhone: 1,
                  uuid: 1,
                  deleted: 1,
                },
              },
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

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        if (GJV.valid(JSON.parse(data.point))) {
          this.model().then((ixps) => {
            ixps.find({ name: String(data.name) }).count(async (err, c) => {
              if (err) resolve({ m: err });
              else if (c > 0) { resolve({ m: 'We have registered in our system more than one organization with the same name' }); } else {
                console.log(transfer); transfer += 1;
                data = {
                  uuid: '',
                  ix_id: String(data.ix_id),
                  name: String(data.name),
                  notes: '', // String(data.notes)
                  nameLong: String(data.name_long),
                  geom: JSON.parse(data.point),
                  address: [
                    {
                      reference: '',
                      street: '',
                      apt: '',
                      city: `${data.city}`,
                      state: '',
                      zipcode: '',
                      country: countries(data.country),
                    },
                  ],
                  media: data.media,
                  proto_unicast: data.proto_unicast,
                  proto_multicast: data.proto_multicast,
                  proto_ipv6: data.proto_ipv6,
                  website: data.website,
                  urlStats: data.url_stats,
                  techEmail: data.tech_email,
                  techPhone: data.tech_phone,
                  policyEmail: data.policy_email,
                  policyPhone: data.policy_phone,
                  tags: [],
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: true,
                  deleted: false,
                };
                // we need search about the information
                ixps.findOneAndUpdate({ ix_id: data.ix_id }, {
                  $setOnInsert: data,
                },
                {
                  returnOriginal: false,
                  upsert: true,
                }, (err, r) => {
                  if (err) reject({ m: err });
                  resolve();
                });
                //
                //
                // ixps.insertOne(data, (err, i) => {
                //   if (err) resolve({ m: err + 0 });
                //   console.log(i);
                //   resolve();
                // });
              }
            });
          }).catch((e) => reject({ m: e + 1 }));
        }
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  view(user, id) {
    return new Promise((resolve, reject) => {
      try {
        redisClient.redisClient.get(`v_ixp_${id}`, (err, reply) => {
          if (err) reject({ m: err });
          else if (reply) resolve(((JSON.parse(reply))));
          else {
            this.model().then((ixp) => {
              ixp.aggregate([
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
                    let: { ixps: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$$ixps', '$ixps'],
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
                    from: 'networks',
                    let: { ixps: '$_id' },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$$ixps', '$ixps'],
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
                    from: 'alerts',
                    let: { elemnt: { $toString: '$_id' } },
                    pipeline: [
                      {
                        $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '4' }, { uuid: user }, { disabled: false }] },
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
                redisClient.set(`v_ixp_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800)
                resolve({ m: 'Loaded', r: c });
              });
            });
          }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((ixp) => {
            id = new ObjectID(id);
            ixp.aggregate([
              {
                $match: {
                  _id: id,
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
              $project: {
                _id: 1,
                coordinates: '$geom.coordinates',
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
        this.model().then((facility) => {
          facility.aggregate([
            { $sort: { name: 1 } },
            {
              $match: { $and: [{ name: { $regex: search, $options: 'i' } }, { nameLong: { $regex: search, $options: 'i' } }] },
            },
            {
              $addFields: { name: { $concat: ['$name', ' (', { $arrayElemAt: ['$address.city', 0] }, ', ', { $arrayElemAt: ['$address.country', 0] }, ')'] } },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  getElemntGeom(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          facility.aggregate([
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
        this.model().then((ixp) => {
          ixp.aggregate([
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
        this.model().then((ixp) => {
          ixp.aggregate([
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
            points = await points.reduce((total, value) => total.concat(value.geom), []);
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
                this.bbox(element._id).then((bbox) => redisClient.set(`ixp_${element._id}`, JSON.stringify(bbox)));
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

module.exports = IXP;
