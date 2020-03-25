const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const countries = require('../helpers/isoCountries');

class Facility {
  constructor() {
    this.model = require('../../models/facility.model');
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
}

module.exports = Facility;
