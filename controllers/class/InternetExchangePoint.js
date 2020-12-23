const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');
const countries = require('../helpers/isoCountries');
const slugToString = require('../helpers/slug');

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
              uuid: user,
              name: String(data.name),
              slug: slugToString(data.name),
              nameLong: String(data.nameLong),
              owners:  (Array.isArray(data.owners)) ? data.owners.map((item) => new ObjectID(item)) : (data.owners !== '') ? await Object.keys(data.owners).map((key) => new ObjectID(data.owners[key])) : [],
              facilities: (Array.isArray(data.facilities)) ? await data.facilities.map((facility) => new ObjectID(facility)) : (data.facilities !== '') ? await Object.keys(data.facilities).map((key) => new ObjectID(data.facilities[key])) : [],
              notes: '', // String(data.notes)
              geom: geom.features[0].geometry,
              media: String(data.media),
              policyEmail: String(data.policyEmail),
              policyPhone: String(data.policyPhone),
              proto_ipv6: (data.proto_ipv6 === 'true' || data.proto_ipv6 === 'True' || data.proto_ipv6 === true),
              proto_multicast: (data.proto_multicast === 'true' || data.proto_multicast === 'True' || data.proto_multicast === true),
              proto_unicast: (data.proto_unicast === 'true' || data.proto_unicast === 'True' || data.proto_unicast === true),
              techEmail: String(data.techEmail),
              techPhone: String(data.techPhone),
              tags: data.tags,
              ix_id: String(data.ix_id),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            ixps.find({ name: data.name }).count((err, c) => {
              if (err) reject({ m: err + 0 });
              else if (c > 0) reject({ m: 'We have another element with the same name' });
              ixps.insertOne(element, async (err, f) => {
                if (err) reject({ m: err + 0 });
                await element.facilities.map((facility) => this.updateFacilityConnection(f.insertedId, facility));
                resolve({ m: 'IXP created', r: f.insertedId });
              });
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
              slug: slugToString(data.name),
              nameLong: String(data.nameLong),
              owners:  (Array.isArray(data.owners)) ? await data.owners.map((item) => new ObjectID(item)) : (data.owners !== '') ? await Object.keys(data.owners).map((key) => new ObjectID(data.owners[key])) : [],
              facilities: (Array.isArray(data.facilities)) ? await data.facilities.map((facility) => new ObjectID(facility)) : (data.facilities !== '') ? await Object.keys(data.facilities).map((key) => new ObjectID(data.facilities[key])) : [],
              notes: '', // String(data.notes)
              geom: geom.features[0].geometry,
              media: String(data.media),
              policyEmail: String(data.policyEmail),
              policyPhone: String(data.policyPhone),
              proto_ipv6: (data.proto_ipv6 === 'true' || data.proto_ipv6 === 'True' || data.proto_ipv6 === true),
              proto_multicast: (data.proto_multicast === 'true' || data.proto_multicast === 'True' || data.proto_multicast === true),
              proto_unicast: (data.proto_unicast === 'true' || data.proto_unicast === 'True' || data.proto_unicast === true),
              techEmail: String(data.techEmail),
              techPhone: String(data.techPhone),
              tags: data.tags,
              ix_id: String(data.ix_id),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            ixps.findOne({ _id: new ObjectID(data._id) }, async (err, c) => {
              if (Array.isArray(c.facilities)) {
                c.facilities = await c.facilities.map((facility) => String(facility));
                const facilityNotFounds = await (Array.isArray(data.facilities) && c.facilities !== undefined) ? c.facilities.filter((f) => !data.facilities.includes(f)) : [];
                await facilityNotFounds.map((facility) => this.removeFacilityConnection(data._id, facility));
              }
              ixps.updateOne({ $and: [adms(user), { _id: new ObjectID(data._id) }] }, { $set: element }, async (err, f) => {
                if (err) reject({ m: err + 0 });
                await element.facilities.map((facility) => this.updateFacilityConnection(new ObjectID(data._id), facility));
                resolve({ m: 'IXP edited' });
              });
            });
          } else { reject({ m: 'Error' }); }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  removeFacilityConnection(idIxp, idFacility) {
    try {
      const facility = require('../../models/facility.model');
      facility().then((facility) => {
        facility.updateOne({ _id: new ObjectID(idFacility) }, { $pull: { ixps: new ObjectID(idIxp) } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 2';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  updateFacilityConnection(idIxp, idFacility) {
    try {
      const facility = require('../../models/facility.model');
      facility().then((facility) => {
        facility.updateOne({ _id: new ObjectID(idFacility) }, { $addToSet: { ixps: idIxp } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 1';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  clusterFacilityConnection(idIxp) {
    return new Promise((resolve, reject) => {
      try {
        redisClient.redisClient.get(`v_cluster_ixp_${idIxp}`, (err, reply) => {
          if (err) reject({ m: err });
          else if (reply) resolve(((JSON.parse(reply))));
          else {
            this.model().then((facilities) => {
              facilities.aggregate(
                [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      geom: 1,
                      facilities: 1,
                    },
                  },
                  {
                    $addFields: { facilities: { $ifNull: ['$facilities', []] } },
                  },
                  {
                    $match: {
                      $and: [{ geom: { $ne: {} } }], // { facilities: { $ne: [] } }
                    },
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
                          $match: {
                            $expr: {
                              $in: ['$_id', '$$f'],
                            },
                          },
                        },
                        {
                          $match: {
                            point: { $ne: {} },
                          },
                        },
                      ],
                      as: 'facilities',
                    },
                  },
                  {
                    $unwind: {
                      path: '$facilities',
                      preserveNullAndEmptyArrays: false,
                    },
                  },
                  {
                    $group: {
                      _id: '$_id',
                      name: { $first: '$name' },
                      point: { $first: '$geom' },
                      features: {
                        $push: {
                          type: 'feature',
                          properties: {
                            name: '$facilities.name',
                            type: 'facility',
                            _id: '$facilities._id',
                          },
                          geometry: '$facilities.point',
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      type: 'FeatureCollection',
                      features: { $concatArrays: ['$features', [{ type: 'feature', properties: { name: '$name', type: 'ixp', _id: '$_id' }, geom: '$point' }]] },
                    },
                  },
                ],
                { allowDiskUse: true },
              ).toArray((err, points) => {
                if (err) reject(err);
                redisClient.set(`v_cluster_ixp_${idIxp}`, JSON.stringify(points), 'EX', 172800);
                resolve(points);
              });
            }).catch((e) => reject({ m: e }));
          }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  delete(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (ixp) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            ixp.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your IXP' });
              else {
                ixp.updateOne(
                  { $and: [adms(user), { _id: id }] }, { $set: { deleted: true, uDate: luxon.DateTime.utc() } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your IXP' });
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

  list(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((ixps) => {
            ixps.aggregate([
              {
                $sort: { slug: 1 },
              },
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
                  rgDate: 1,
                  uDate: 1,
                },
              },
              {
                $sort: { slug: 1 },
              },
              {
                $match: adms(user),
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
                  nameLong: String(data.name_long),
                  owners: [],
                  notes: '', // String(data.notes)
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
                  $addFields: {
                    cluster: {
                      type: 'FeatureCollection',
                      features: '$facsElements.elmnt',
                    },
                  },
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
                    as: 'facilities',
                  },
                },
                {
                  $lookup: {
                    from: 'organizations',
                    let: { f: '$owners' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
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
                          label: 1,
                          organizations: 1,
                        },
                      },
                      { $sort: { label: 1 } },
                    ],
                    as: 'networks',
                  },
                },

                // {
                //   $lookup: {
                //     from: 'organizations',
                //     let: { networks: '$networks' },
                //     pipeline: [
                //       {
                //         $addFields: {
                //           idsorgs: { $map: { input: '$$networks.organizations', as: 'orgs', in: '$$orgs' } },
                //         },
                //       },
                //       {
                //         $match: {
                //           $and: [
                //             {
                //               $expr: {
                //                 $in: ['$_id', {
                //                   $cond: {
                //                     if: { $isArray: { $arrayElemAt: ['$idsorgs', 0] } },
                //                     then: { $arrayElemAt: ['$idsorgs', 0] },
                //                     else: [],
                //                   },
                //                 },
                //                 ],
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
                //     as: 'organizations',
                //   },
                // },
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
                    facsElements: 0,
                    geom: 0,
                    status: 0,
                    deleted: 0,
                  },
                },
              ]).toArray((err, c) => {
                if (err) reject(err);
                redisClient.set(`v_ixp_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
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
        this.model().then((cables) => {
          cables.aggregate([
            {
              $match: {
                _id: new ObjectID(id),
              },
            },
            {
              $project: {
                name: 1,
                geom: 1,
              },
            },
            {
              $unwind: '$geom.features',
            },
            {
              $addFields: {
                'geom.features.properties.name': '$name',
              },
            },
            {
              $group: {
                _id: '$_id',
                geom: {
                  $push: '$geom',
                },
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
              {
                $lookup: {
                  from: 'facilities',
                  let: { f: '$facilities' },
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
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
                        ix_id: { $ifNull: ['$ix_id', ''] },
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
                      $project: {
                        _id: 1,
                        name: 1,
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
                  ],
                  as: 'owners',
                },
              },
              {
                $addFields: {
                  geom: {
                    type: 'Feature',
                    properties: {
                      name: '$name',
                      _id: '$_id',
                    },
                    geometry: '$geom',
                  },
                },
              },
              {
                $project: {
                  'geom.coordinates': 0,
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
            if (err) { reject(err); } else if (c[0] !== undefined) {
              if (c[0].coordinates !== undefined) {
                resolve({ m: 'Loaded', r: c[0].coordinates });
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
        this.model().then((ixp) => {
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
          ixp.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
                nameLong: 1,
                alerts: 1,
                deleted: 1,
              },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s.toLowerCase(), $options: 'i' } }, { nameLong: { $regex: search.s, $options: 'i' } }, (String(search.psz) !== '1') ? { deleted: { $ne: true } } : {}] },
            },
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

  // getElementGeom(id) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.model().then((ixp) => {
  //         ixp.aggregate([
  //           {
  //             $match: {
  //               _id: new ObjectID(id),
  //             },
  //           },
  //           {
  //             $project: {
  //               geom: 1,
  //             },
  //           },
  //         ]).toArray((err, r) => {
  //           if (err) reject(err);
  //           resolve({ m: 'Loaded', r: r[0].geom });
  //         });
  //       });
  //     } catch (e) { reject({ m: e }); }
  //   });
  // }

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
                _id: 1,
                name: 1,
                geom: 1,
              },
            },
            {
              $project: {
                _id: 1,
                'geom.type': 'Feature',
                'geom.geometry': '$geom',
                'geom.properties.name': '$name',
              },
            },
            {
              $group: {
                _id: '$_id',
                geom: {
                  $push: '$geom',
                },
              },
            },
            // {
            //   $project: {
            //     type: 'FeatureCollection',
            //     features: '$geom',
            //   },
            // },
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
                this.clusterFacilityConnection(element._id);
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

  getNameElemnt(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((ixp) => {
          ixp.aggregate([
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

  checkPeeringDb(ix_id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((search) => {
          search.find({ ix_id }).count((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        });
      } catch (e) {
        reject({ m: e });
      }
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

  connectionIXPFAC() {
    return new Promise((resolve, reject) => {
      try {
        const pool = require('../../config/pgSQL.js');
        let facility = require('../../models/facility.model');
        this.model().then((ixp) => {
          ixp.aggregate([{$project: { _id: 1, ix_id: 1}}]).toArray(async (err, getIXPS) => {
            if (err) { reject({ m: 'Cant conntinue' }); }
            await getIXPS.map((elm) => {
              const SQLquery = `SELECT ix_id, fac_id FROM public.ix_fac WHERE ix_id = ${elm.ix_id}`;
              pool.query(SQLquery, async (err, data) => {
                if (data) {
                  await data.rows.map((connection) => {
                    facility().then((facility) => {
                      if(elm !== null){
                        facility.findOneAndUpdate({ fac_id: String(connection.fac_id) },{ $addToSet: { ixps: new ObjectID(elm._id) } }, (err, f) => {
                          if (f !== null && elm !== null && f.value !== null) {
                            ixp.updateOne({ _id: new ObjectID(elm._id) }, { $addToSet: { facilities: new ObjectID(f.value._id) } }, (err, u) =>{
                              console.log('IXP ---->', elm._id, ' ====> Fac', f.value._id, new Date());
                              return 'Ready';
                            });
                          }
                        });
                      }
                    });
                  });
                } else {
                  console.log('Conttinue working');
                }
              });
            });
            resolve({ m: 'Completed' });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }
}

module.exports = IXP;
