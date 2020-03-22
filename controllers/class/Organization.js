const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const countries = require('../helpers/isoCountries');
const adms = require('../helpers/adms');

class Organization {
  constructor() {
    // eslint-disable-next-line global-require
    this.model = require('../../models/organization.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((organization) => {
            // we need to validate if  don't have another organization with the same name
            // TODO: discard deleted files
            organization.find({ name: String(data.name) }).count(async (err, c) => {
              if (err) reject({ m: err });
              else if (c > 0) reject({ m: 'We have registered in our system more than one organization with the same name' });
              else {
                // data.address = JSON.parse(data.address);
                data = {
                  uuid: String(user),
                  name: String(data.name),
                  notes: '', // String(data.notes)
                  logo: String(data.logo),
                  information: String(data.information),
                  // TODO: when array is empty not use the map
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                  url: String(data.url),
                  premium: false,
                  istrusted: false,
                  non_peering: false,
                  tags: [],
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: false,
                  deleted: false,
                  validated: false,
                };
                // console.log( JSON.stringify( data ) );
                organization.insertOne(data, (err, i) => {
                  // TODO: validation insert
                  if (err) reject({ m: err });
                  resolve({ m: 'Organization created' });
                });
              }
            });
          }).catch((e) => { reject(e); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((organization) => {
          // we need to validate if  don't have another organization with the same name
          // TODO: discard deleted files
          organization.find({ ooid: String(data.ooid) }).count(async (err, c) => {
            if (err) resolve({ m: err });
            else if (c > 0) resolve({ m: 'We have registered in our system more than one organization with the same name' });
            else {
              // data.address = JSON.parse(data.address);
              data = {
                uuid: '',
                ooid: String(data.ooid),
                name: String(data.name),
                notes: '', // String(data.notes)
                logo: (data.logo !== null && data.logo !== '') ? String(data.logo) : '',
                information: '',
                address: [
                  {
                    reference: `${data.address1} ${data.address2}`,
                    street: `${data.address1} ${data.address2}`,
                    apt: '',
                    city: `${data.city}`,
                    state: `${data.state}`,
                    zipcode: `${data.zipcode}`,
                    country: countries(data.country),
                  },
                ],
                url: String(data.url),
                premium: false,
                istrusted: false,
                non_peering: (data.non_peering),
                tags: [],
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
                status: false,
                deleted: false,
                validated: false,
              };
              // console.log( JSON.stringify( data ) );
              organization.insertOne(data, (err, i) => {
                // TODO: validation insert
                if (err) resolve({ m: err });
                resolve({ m: 'Organization created' });
              });
            }
          });
        }).catch((e) => { reject(e); });
      } catch (e) { resolve({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (organization) => {
            const id = new ObjectID(data._id);
            // we need to validate if  don't have another organization with the same name
            organization.find({
              $and:
                 [{ _id: { $ne: id } }, { name: String(data.name) }],
            }).count(async (err, c) => {
              if (err) reject({ m: err });
              else if (c > 0) reject({ m: 'We have registered in our system more than one organization with the same name' });
              else {
                data = {
                  name: String(data.name),
                  logo: String(data.logo),
                  information: String(data.information),
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                  url: String(data.url),
                  tags: [],
                  uDate: luxon.DateTime.utc(),
                };
                organization.updateOne(
                  { _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
                    else resolve({ m: 'Loaded', r: data });
                  },
                );
              }
            });
          }).catch((e) => reject(e));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((organization) => {
            organization.aggregate([{
              $match: {
                $and: [
                  adms(user),
                  { deleted: false },
                ],
              },
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
              $project: {
                uuid: 0,
              },
            }]).toArray((err, rOrganizations) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rOrganizations });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  delete(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (organization) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            organization.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your organization' });
              else {
                organization.updateOne(
                  { _id: id, uuid: String(user) }, { $set: { deleted: true } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your organization' });
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

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((organization) => {
            id = new ObjectID(id);
            organization.findOne({ _id: id }, (err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o });
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  // delete(usr, id) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.model().then((organization) => {
  //         // eslint-disable-next-line no-param-reassign
  //         id = new ObjectID(id);
  //         organization.find({ $and: [{ _id: id }, { uuid: usr }] }).count((err, c) => {
  //           if (err) reject(new Error({ m: err }));
  //           else if (c === 0) reject({ m: 'We cannot delete your organization' });
  //           else {
  //             // TODO: we need verify if we have connection in another collections
  //             organization.deleteOne({ _id: id }, (err, d) => {
  //               if (err) reject({ m: err });
  //               resolve({ m: 'Deleted' });
  //             });
  //           }
  //         });
  //       });
  //     } catch (e) { reject({ m: e }); }
  //   });
  // }

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

  view(user, id) {
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
              $lookup: {
                from: 'networks',
                let: { idorg: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$$idorg', '$organizations'],
                          },
                        },
                        {
                          deleted: false,
                        },
                      ],
                    },
                  },
                  // {
                  //   $lookup: {
                  //     from: 'cables',
                  //     let: { cables: '$cables' },
                  //     pipeline: [
                  //       {
                  //         $addFields: {
                  //           idscables: '$$cables',
                  //         },
                  //       },
                  //       {
                  //         $match: {
                  //           $expr: {
                  //             $in: ['$_id', '$idscables'],
                  //           },
                  //         },
                  //       },
                  //       {
                  //         $project: {
                  //           _id: 1,
                  //           name: 1,
                  //         },
                  //       },
                  //     ],
                  //     as: 'cables',
                  //   },
                  // },
                  // {
                  //   $lookup: {
                  //     from: 'cls',
                  //     let: { cls: '$cls' },
                  //     pipeline: [
                  //       {
                  //         $addFields: {
                  //           idscls: '$$cls',
                  //         },
                  //       },
                  //       {
                  //         $match: {
                  //           $expr: {
                  //             $in: ['$_id', '$idscls'],
                  //           },
                  //         },
                  //       },
                  //       {
                  //         $project: {
                  //           _id: 1,
                  //           name: 1,
                  //         },
                  //       },
                  //     ],
                  //     as: 'cls',
                  //   },
                  // },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      // cls: 1,
                      // cables: 1,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $lookup: {
                from: 'alerts',
                let: { elemnt: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '7' }, { uuid: user }, { disabled: false }] },
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
                uuid: 0,
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

  partners() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((organizations) => {
          organizations.aggregate([
            { $match: { premium: true } },
            { $project: { _id: 1, name: 1, logo: 1 } }]).toArray((err, r) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r });
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }

  istrusted() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((organizations) => {
          organizations.aggregate([
            { $match: { istrusted: true } },
            { $project: { _id: 1, name: 1, logo: 1 } }]).toArray((err, r) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r });
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Organization;
