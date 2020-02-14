const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const countries = require('../helpers/isoCountries');

class Facility {
  constructor() {
    this.model = require('../../models/facility.model');
  }

  addByTransfer(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (GJV.valid(data.polygon) && GJV.valid(JSON.parse(data.point)) && data.polygon.geometry) {
          this.model().then((facility) => {
            data.polygon.properties.height = (data.polygon.properties.height === '') ? 30 : parseFloat(data.polygon.properties.height);
            data = {
              uuid: String(user),
              fac_id: String(data.fac_id),
              name: String(data.name),
              notes: '', // String(data.notes)
              point: JSON.parse(data.point),
              address: [
                {
                  reference: '',
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
                features: [data.polygon],
              },
              ixps: [],
              t: data.osm_telecom,
              startDate: data.osm_start_date,
              building: (data.osm_building === 'yes') ? 'Building' : data.osm_building,
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: true,
            };
            // we need search about the information
            facility.find({ fac_id: data.fac_id }).count((err, f) => {
              if (err) reject({ m: err + 0 });
              else if (f > 0) { console.log('Repeat'); reject(); } else {
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
                      $expr: {
                        $in: ['$$facilities', '$facilities'],
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
                point: 0,
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
}

module.exports = Facility;
