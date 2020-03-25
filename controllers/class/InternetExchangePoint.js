const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const countries = require('../helpers/isoCountries');

let transfer = 0;
const repeat = 0;
class IXP {
  constructor() { this.model = require('../../models/ixp.model'); }

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
            resolve({ m: 'Loaded', r: c });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  bbox(user, id) {
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
}

module.exports = IXP;
