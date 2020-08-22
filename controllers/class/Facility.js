const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');
const countries = require('../helpers/isoCountries');

const { adms } = require('../helpers/adms');


class Facility {
  constructor() {
    this.model = require('../../models/facility.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (facility) => {
          if (data) {
            const element = {
              uuid: user,
              name: String(data.name),
              point: {},
              address: (Array.isArray(data.address)) ? await data.address.map((address) => JSON.parse(address)) : [],
              website: data.website,
              geom: JSON.parse(data.geom),
              ixps: (Array.isArray(data.ixps)) ? await data.ixps.map((ixp) => new ObjectID(ixp)) : [],
              tags: data.tags,
              t: data.t,
              StartDate: String(data.StartDate),
              building: String(data.building),
              owners: (Array.isArray(data.owners)) ? await data.owners.map((owner) => new ObjectID(owner)) : [],
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            facility.find({ name: data.name }).count((err, c) => {
              if (err) reject({ m: err + 0 });
              else if (c > 0) reject({ m: 'We have another element with the same name' });
              facility.insertOne(element, (err, f) => {
                if (err) reject({ m: err + 0 });
                resolve({ m: 'Facility created' });
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
        this.model().then(async (facility) => {
          if (data) {
            const element = {
              name: String(data.name),
              point: {},
              address: (Array.isArray(data.address)) ? await data.address.map((address) => JSON.parse(address)) : [],
              website: data.website,
              geom: JSON.parse(data.geom),
              ixps: (Array.isArray(data.ixps)) ? await data.ixps.map((ixp) => new ObjectID(ixp)) : [],
              tags: data.tags,
              t: data.t,
              StartDate: String(data.StartDate),
              building: String(data.building),
              owners: (Array.isArray(data.owners)) ? await data.owners.map((owner) => new ObjectID(owner)) : [],
              uDate: luxon.DateTime.utc(),
              deleted: false,
            };
            facility.updateOne({ $and: [adms(user), { _id: new ObjectID(data._id) }] }, { $set: element }, (err, f) => {
              if (err) reject({ m: err + 0 });
              resolve({ m: 'Facility created' });
            });
          } else { reject({ m: 'Error' }); }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  delete(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (facility) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            facility.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your IXP' });
              else {
                facility.updateOne(
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

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          facility.find({ fac_id: String(data.fac_id) }).count(async (err, c) => {
            if (err) resolve({ m: err });
            else if (c > 0) resolve({ m: 'We have registered in our system more than one organization with the same name' });
            else {
              data.polygon.properties.height = (data.polygon.properties.height === '') ? 30 : parseFloat(data.polygon.properties.height);
              data = {
                uuid: '',
                fac_id: String(data.fac_id),
                name: String(data.name),
                notes: '', // String(data.notes)
                point: JSON.parse(data.point),
                address: [
                  {
                    reference: `${data.address1} ${data.address2}`,
                    street: `${data.address1} ${data.address2}`,
                    apt: `#${data.osm_addr_housenumber}`,
                    city: data.city,
                    state: data.state,
                    zipcode: data.zipcode,
                    country: countries(data.country),
                  },
                ],
                websites: data.website,
                // information: String(data.information),
                geom: {
                  type: 'FeatureCollection',
                  features: [(data.polygon.geometry) ? data.polygon : { type: 'Feature', geometry: JSON.parse(data.point) }],
                },
                ixps: [],
                tags: [],
                t: data.osm_telecom,
                startDate: data.osm_start_date,
                building: (data.osm_building === 'yes') ? 'Building' : data.osm_building,
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
                status: true,
                deleted: false,
              };// we need search about the information
              facility.insertOne(data, (err, i) => {
                if (err) resolve({ m: err + 0 });
                console.log(i);
                resolve();
              });
            }
          });
        }).catch((e) => reject({ m: e + 1 }));
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  list(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((facilities) => {
            facilities.aggregate([
              {
                $project: {
                  name: 1,
                  fac_id: 1,
                  website: 1,
                  uuid: 1,
                  deleted: 1,
                  rgDate: 1,
                  uDate: 1,
                },
              },
              {
                $sort: { name: 1 },
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

  view(user, id) {
    return new Promise((resolve, reject) => {
      try {
        redisClient.redisClient.get(`v_facility_${id}`, (err, reply) => {
          if (err) reject({ m: err });
          else if (reply) resolve(((JSON.parse(reply))));
          else {
            this.model().then((facility) => {
              facility.aggregate([
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
                    let: { facilities: '$_id' },
                    pipeline: [
                      {
                        $addFields: {
                          facilities: {
                            $cond: {
                              if: { $eq: [{ $type: '$facilities' }, 'array'] },
                              then: '$facilities',
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
                                $in: ['$$facilities', '$facilities'],
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
                    let: { ixps: '$_id' },
                    pipeline: [
                      {
                        $addFields: {
                          ixps: {
                            $cond: {
                              if: { $eq: [{ $type: '$ixps' }, 'array'] },
                              then: '$ixps',
                              else: [],
                            },
                          },
                        },
                      },
                      {
                        $match: {
                          $expr: {
                            $in: ['$$ixps', '$ixps'],
                          },
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
                    let: { f: '$owners' },
                    pipeline: [
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$owners' }, 'array'] },
                              then: '$owners',
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
                    point: 0,
                    status: 0,
                    deleted: 0,
                  },
                },
              ]).toArray((err, c) => {
                if (err) reject(err);
                redisClient.set(`v_facility_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
                resolve({ m: 'Loaded', r: c });
              });
            });
          }
        });
      } catch (e) { reject({ m: e }); }
    });
    // return new Promise((resolve, reject) => {
    //   try {
    //     redisClient.redisClient.get(`v_facility_${id}`, (err, reply) => {
    //       if (err) reject({ m: err });
    //       else if (reply) resolve(((JSON.parse(reply))));
    //       else {
    //         this.model().then((facility) => {
    //           facility.aggregate([
    //             {
    //               $match: {
    //                 _id: new ObjectID(id),
    //               },
    //             },
    //             {
    //               $project: { geom: 0 },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'cables',
    //                 let: { facilities: '$_id' },
    //                 pipeline: [
    //                   {
    //                     $addFields: {
    //                       facilities: {
    //                         $cond: {
    //                           if: { $eq: [{ $type: '$facilities' }, 'array'] },
    //                           then: '$facilities',
    //                           else: [],
    //                         },
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $match: {
    //                       $and: [
    //                         {
    //                           $expr: {
    //                             $in: ['$$facilities', '$facilities'],
    //                           },
    //                         },
    //                         {
    //                           deleted: false,
    //                         },
    //                       ],
    //                     },
    //                   },
    //                   {
    //                     $project: {
    //                       _id: 1,
    //                       name: 1,
    //                     },
    //                   },
    //                 ],
    //                 as: 'cables',
    //               },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'networks',
    //                 let: { ixps: '$_id' },
    //                 pipeline: [
    //                   {
    //                     $addFields: {
    //                       ixps: {
    //                         $cond: {
    //                           if: { $eq: [{ $type: '$ixps' }, 'array'] },
    //                           then: '$ixps',
    //                           else: [],
    //                         },
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $match: {
    //                       $expr: {
    //                         $in: ['$$ixps', '$ixps'],
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $project: {
    //                       _id: 1,
    //                       name: 1,
    //                       organizations: 1,
    //                     },
    //                   },
    //                 ],
    //                 as: 'networks',
    //               },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'organizations',
    //                 let: { f: '$owners' },
    //                 pipeline: [
    //                   {
    //                     $addFields: {
    //                       f: {
    //                         $cond: {
    //                           if: { $eq: [{ $type: '$owners' }, 'array'] },
    //                           then: '$owners',
    //                           else: [],
    //                         },
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $match: {
    //                       $and: [
    //                         {
    //                           $expr: {
    //                             $in: ['$_id', '$f'],
    //                           },
    //                         },
    //                         {
    //                           deleted: false,
    //                         },
    //                       ],
    //                     },
    //                   },
    //                   {
    //                     $project: {
    //                       label: '$name',
    //                     },
    //                   },
    //                 ],
    //                 as: 'owners',
    //               },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'alerts',
    //                 let: { elemnt: { $toString: '$_id' } },
    //                 pipeline: [
    //                   {
    //                     $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '4' }, { uuid: user }, { disabled: false }] },
    //                   },
    //                 ],
    //                 as: 'alert',
    //               },
    //             },
    //             {
    //               $addFields: { alert: { $size: '$alert' } },
    //             },
    //             {
    //               $project: {
    //                 point: 0,
    //                 status: 0,
    //                 deleted: 0,
    //               },
    //             },
    //           ]).toArray((err, c) => {
    //             if (err) reject(err);
    //             redisClient.set(`v_facility_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
    //             resolve({ m: 'Loaded', r: c });
    //           });
    //         });
    //       }
    //     });
    //   } catch (e) { reject({ m: e }); }
    // });
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

  getNameElemnt(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          facility.aggregate([
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

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((facility) => {
            id = new ObjectID(id);
            facility.aggregate([
              {
                $match: {
                  _id: id,
                },
              },
              {
                $addFields: {
                  owners: {
                    $cond: {
                      if: { $eq: [{ $type: '$owners' }, 'array'] },
                      then: '$owners',
                      else: [],
                    },
                  },
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
              {
                $unwind: '$geom.features',
              },
              {
                $addFields: {
                  'geom.features.properties.name': '$name',
                  'geom.features.properties._id': '$_id',
                },
              },
              {
                $group: {
                  _id: '$_id',
                  name: { $first: '$name' },
                  notes: { $first: '$notes' },
                  point: { $first: '$point' },
                  address: { $first: '$address' },
                  website: { $first: '$website' },
                  ixps: { $first: '$ixps' },
                  tags: { $first: '$tags' },
                  t: { $first: '$t' },
                  startDate: { $first: '$startDate' },
                  building: { $first: '$building' },
                  rgDate: { $first: '$rgDate' },
                  uDate: { $first: '$uDate' },
                  status: { $first: '$status' },
                  deleted: { $first: '$deleted' },
                  owners: { $first: '$owners' },
                  features: { $push: '$geom.features' },
                },
              },
              {
                $addFields: {
                  geom: {
                    type: 'FeatureCollection',
                    features: '$features',
                  },
                },
              },
              {
                $project: {
                  features: 0,
                },
              },
            ]).toArray((err, o) => {
              console.log(err);
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o[0] });
            });
          });
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
        this.model().then((facility) => {
          facility.aggregate([
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
        this.model().then((facility) => {
          const uuid = (search.psz === '1') ? adms(user) : {};
          let sortBy = {};
          if (search.sortBy !== undefined || search.sortBy !== '') {
            // eslint-disable-next-line no-unused-vars
            switch (search.sortBy) {
              case 'nameAsc':
                sortBy = { name: 1 };
                break;
              case 'nameDesc':
                sortBy = { name: -1 };
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
                sortBy = { name: 1 };
                break;
            }
          } else { sortBy = { name: 1 }; }
          facility.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                alerts: 1,
                deleted: 1,
                rgDate: 1,
                uDate: 1,
              },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s, $options: 'i' } }, { deleted: false }] },
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
              $sort: sortBy,
            },
            { $limit: 20 },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  // getElementGeom(id) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.model().then((facility) => {
  //         facility.aggregate([
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
        this.model().then((facility) => {
          facility.aggregate([
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
                  $push: '$geom.features',
                },
              },
            },
            // {
            //   $project: {
            //     type: 'FeatureCollection',
            //     features: '$geom.features',
            //   },
            // },
          ]).toArray(async (err, polygon) => {
            if (err) return 'Error';
            // // we'll going to create the master file for ixps
            polygon = await polygon.reduce((total, value) => total.concat(value.geom), []);
            polygon = {
              type: 'FeatureCollection',
              features: polygon,
            };
            resolve({ m: 'Loaded', r: polygon });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  getMultiElementsGeomPoints(ids) {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(ids) || ids.length === 0) resolve({ m: 'Loaded', r: false });
        ids = ids.map((i) => new ObjectID(i));
        this.model().then((facility) => {
          facility.aggregate([
            {
              $match: {
                $expr: {
                  $in: ['$_id', ids],
                },
              },
            },
            {
              $project: {
                geom: {
                  type: 'Feature',
                  geometry: '$point',
                  properties: {
                    _id: '$_id',
                    name: '$name',
                  },
                },
              },
            },
            // {
            //   $project: {
            //     _id: 1,
            //     name: 1,
            //     geom: {
            //       type: 'Feature',
            //       geometry: '$point',
            //       properties: {
            //         _id: '$_id',
            //         name: '$name',
            //       },
            //     },
            //   },
            // },
            // {
            //   $unwind: '$geom.features',
            // },
            // {
            //   $addFields: {
            //     'geom.features.properties.name': '$name',
            //   },
            // },
            // {
            //   $group: {
            //     _id: '$_id',
            //     features: {
            //       $push: '$geom.features',
            //     },
            //   },
            // },
            // {
            //   $project: {
            //     type: 'FeatureCollection',
            //     features: '$geom.features',
            //   },
            // },
          ]).toArray(async (err, points) => {
            if (err) return 'Error';
            // // we'll going to create the master file for ixps
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
                this.bbox(element._id).then((bbox) => redisClient.set(`facility_${element._id}`, JSON.stringify(bbox)));
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
        console.log(name);
        this.model().then((search) => {
          search.find({ name }).count((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        });
      } catch (e) {
        reject({m: e });
      }
    });
  }

  permanentDelete(usr, id, code) {
    return new Promise((resolve, reject) => {
      try {
        if (adms(usr) === {}) {
          if (true) { //code === process.env.securityCode
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

  clustering(){
    return new Promise((resolve, reject) => {

    });
  }
}

module.exports = Facility;
