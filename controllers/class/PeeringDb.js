const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const request = require('request');
const pool = require('../../config/pgSQL');
//
const facility = require('../../models/facility.model');
const ixp = require('../../models/ixp.model');
const org = require('../../models/organization.model');
//
const countries = require('../helpers/isoCountries');

class PeeringDb {
  updateInformation(ixIid, ixPid) {
    return new Promise((resolve, reject) => {
      try {
        if (ixPid !== undefined && ixPid !== '') {
          const url = `https://www.peeringdb.com/api/ix/${ixPid}`;
          const options = { json: true };
          request(url, options, async (error, res, body) => {
            if (error) { reject(ixIid); } else if (!error && res.statusCode === 200) {
              if (body.data[0]) {
                if (Array.isArray(body.data[0].fac_set)) {

                  if (body.data[0].org !== {}) {
                    org().then((org) => {
                      ixp().then(async (ixp) => {
                        org.findOne({ ooid: String(body.data[0].org_id) }, (err, or) => {
                          if (err) { reject(); } else if (or) {
                            ixp.updateOne({ _id: new ObjectID(ixIid) }, { $addToSet: { owners: new ObjectID(or._id) } }, (err, u) => {
                              console.log(`Organization updated ====> ${or._id} ===> ${ixIid} ====> ${ixPid}`);
                              // if (err) { reject(ixIid); }
                              return 'Ok';
                            });
                          }
                        });
                      });
                    });
                  }

                  await body.data[0].fac_set.map((fac) => {
                    facility().then((facility) => {
                      ixp().then((ixp) => {
                        facility.findOneAndUpdate({ fac_id: String(fac.id) }, { $addToSet: { ixps: new ObjectID(ixIid) } }, (err, u) => {
                          if (u.ok === 1 && u.value !== null && u.value !== undefined) {
                            if (u.value._id !== undefined) {
                              ixp.updateOne({ _id: new ObjectID(ixIid) },
                                {
                                  $addToSet: { facilities: new ObjectID(u.value._id) },
                                  $set: {
                                    proto_unicast: body.data[0].proto_unicast,
                                    proto_multicast: body.data[0].proto_multicast,
                                    proto_ipv6: body.data[0].proto_ipv6,
                                    website: body.data[0].website,
                                    url_stats: body.data[0].url_stats,
                                    tech_email: body.data[0].tech_email,
                                    tech_phone: body.data[0].tech_phone,
                                    policy_email: body.data[0].policy_email,
                                    policy_phone: body.data[0].policy_phone,
                                    media: body.data[0].media,
                                  },
                                }, (err, ixu) => {
                                  console.log(`Facilities updated ====> ${u.value._id} ===> ${ixIid} ====> ${ixPid}`);
                                  // if (err) { reject(ixIid); }
                                  return 'Ok';
                                });
                            }
                          }
                        });
                      });
                    });
                  });
                }

                resolve(ixIid);
              }
            }
          });
        }
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }

  getIxpConnections() {
    return new Promise((resolve, reject) => {
      try {
        const ixps = require('../../models/ixp.model');
        ixps().then((ixps) => {
          ixps.aggregate(
            [
              {
                $project: {
                  _id: 1,
                  ix_id: 1,
                },
              },
            ],
          ).toArray(async (err, list) => {
            if (err) reject({ m: err });
            Promise.all(list.map((ix) => this.updateInformation(ix._id, ix.ix_id))).then((r) => {
              resolve({ m: 'Information saved' });
            }).catch((r) => {
              console.log(r);
              reject({ m: 'Error' });
            });
          });
        });
      } catch (e) {

      }
    });
  }

  getFacilitiesInformation(){
    return new Promise((resolve, reject) => {
      facility().then((facility) => {
        org().then((organization) => {
          facility.aggregate([
            {
              $project: {
                _id: 1,
                fac_id: 1,
              },
            },
          ]).toArray(async (err, facs) => {
            if (err) {}
            await facs.map((f) => {
              if (f.fac_id !== undefined && f.fac_id !== ''){
                const url = `https://www.peeringdb.com/api/fac/${f.fac_id}`;
                const options = { json: true };
                request(url, options, async (error, res, body) => {
                  if (body !== undefined && body.data !== undefined && body.data !== []) {
                    organization.findOne({ ooid: String(body.data[0].org_id) }, (err, r) => {
                      if (r !== null) {
                        const address = [
                          {
                            reference: `${body.data[0].address1} ${body.data[0].address2}`,
                            street: `${body.data[0].address1} ${body.data[0].address2}`,
                            apt: '',
                            city: body.data[0].city,
                            state: body.data[0].state,
                            zipcode: body.data[0].zipcode,
                            country: countries(body.data[0].country),
                          },
                        ];
                        facility.updateOne({ fac_id: String(f.fac_id) }, { $addToSet: { owners: new ObjectID(r._id) }, $set: { name: body.data[0].name, building: 'data_center', address, uDate: luxon.DateTime.utc() } }, (err, fu) => {
                          console.log('Update facility ====>', f.fac_id, ' =====> ', body.data[0].org_id, '=====>', fu.result.nModified);
                          return '';
                        });
                      }
                    });
                  }
                });
              }
            });
            resolve({ m: 'Information saved' });
          });
        });
      }).catch((e) => {

      });
    });
  }
}
module.exports = PeeringDb;
