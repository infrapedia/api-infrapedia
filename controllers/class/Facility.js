const luxon = require('luxon');
const GJV = require('geojson-validation');
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
              point: JSON.parse(data.point),
              address: [
                {
                  reference: '',
                  street: `${data.address1} ${data.address2}`,
                  apt: '',
                  city: data.city,
                  state: data.state,
                  zipcode: data.zipcode,
                  country: countries(data.country),
                },
              ],
              websites: data.website,
              // information: String(data.information),
              polygon: {
                type: 'FeatureCollection',
                features: [data.polygon],
              },
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: true,
            };
            // we need search about the information
            facility.find({ fac_id: data }).count((err, f) => {
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
}

module.exports = Facility;
