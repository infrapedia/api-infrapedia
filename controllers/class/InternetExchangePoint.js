const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const countries = require('../helpers/isoCountries');

class IXP {
  constructor() { this.model = require('../../models/ixp.model'); }

  addByTransfer(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (GJV.valid(JSON.parse(data.point))) {
          this.model().then((facility) => {
            data = {
              uuid: String(user),
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
                  city: data.city,
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
            facility.find({ nameLong: data.name_long }).count((err, f) => {
              if (err) reject({ m: err + 0 });
              else if (f > 0) { reject(); } else {
                facility.insertOne(data, (err, i) => {
                  if (err) reject({ m: err + 0 });
                  resolve();
                });
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
                      $expr: {
                        $in: ['$$ixps', '$ixps'],
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
              $match: { $and: [{ name: { $regex: search, $options: 'i' } }, { nameLong: { $regex: search, $options: 'i' } }] } ,
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
        ids = ids.map((i) => new ObjectID(i));
        console.log(ids);
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
          ]).toArray(async (err, polygon) => {
            if (err) return 'Error';
            // we'll going to create the master file for ixps
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
}

module.exports = IXP;
