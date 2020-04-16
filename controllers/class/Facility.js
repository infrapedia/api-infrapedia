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
              name: String(data.name),
              point: {},
              address: await data.address.map((address) => JSON.parse(address)),
              website: data.website,
              geom: JSON.parse(data.geom),
              ixps: await data.ixps.map((ixp) => new ObjectID(ixp)),
              tags: data.tags,
              t: data.t,
              StartDate: String(data.StartDate),
              building: String(data.building),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            facility.insertOne(element, (err, f) => {
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
        this.model().then(async (facility) => {
          if (data) {
            const element = {
              name: String(data.name),
              point: {},
              address: await data.address.map((address) => JSON.parse(address)),
              website: data.website,
              geom: JSON.parse(data.geom),
              ixps: await data.ixps.map((ixp) => new ObjectID(ixp)),
              tags: data.tags,
              t: data.t,
              StartDate: String(data.StartDate),
              building: String(data.building),
              uDate: luxon.DateTime.utc(),
              deleted: false,
            };
            facility.updateOne({ _id: new ObjectID(data._id) }, { $set: element }, (err, f) => {
              if (err) reject({ m: err + 0 });
              resolve({ m: 'Facility created' });
            });
          } else { reject({ m: 'Error' }); }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          facility.find({ fac_id: String(data.fac_id) }).count(async (err, c) => {
            console.log(c);
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
        this.model().then((facility) => {
          facility.aggregate([
            {
              $match: {
                _id: new ObjectID(id),
              },
            },
            {
              $project: {
                _id: 1,
                coordinates: '$point.coordinates',
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
            {
              $match: { name: { $regex: search, $options: 'i' } },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
            { $sort: { name: 1 } },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  getElementGeom(id) {
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
                geom: 1,
              },
            },
          ]).toArray(async (err, polygon) => {
            if (err) return 'Error';
            // we'll going to create the master file for ixps
            polygon = await polygon.reduce((total, value) => total.concat(value.geom.features), []);
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
}

module.exports = Facility;
