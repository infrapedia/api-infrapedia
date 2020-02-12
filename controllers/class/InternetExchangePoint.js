const luxon = require('luxon');
const GJV = require('geojson-validation');
const countries = require('../helpers/isoCountries');

class IXP {
  constructor() {
    this.model = require('../../models/ixp.model');
  }

  addByTransfer(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (GJV.valid(JSON.parse(data.point))) {
          this.model().then((facility) => {
            data = {
              uuid: String(user),
              ix_id: String(data.ix_id),
              name: String(data.name),
              nameLong: String(data.name_long),
              point: JSON.parse(data.point),
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
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: true,
            };
            // we need search about the information
            facility.find({ nameLong: data.name_long }).count((err, f) => {
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
        this.model().then((facility) => {
          facility.aggregate([
            {
              $match: { $and: [{ name: { $regex: search, $options: 'i' } }, { nameLong: { $regex: search, $options: 'i' } }] } ,
            },
            {
              $addFields: { nameLong: { $concat: ['$name', ' - ', '$nameLong', ' (', { $arrayElemAt: ['$address.city', 0] }, ', ', { $arrayElemAt: ['$address.country', 0] }, ')'] } },
            },
            {
              $project: {
                _id: 1,
                nameLong: 1,
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

module.exports = IXP;
