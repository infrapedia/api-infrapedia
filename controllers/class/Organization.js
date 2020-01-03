const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Organization {
  constructor() {
    // eslint-disable-next-line global-require
    this.model = require('../../models/organization.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (data.name && user) {
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
                  logo: String(data.logo),
                  notes: String(data.notes),
                  // TODO: when array is empty not use the map
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                  premium: false,
                  non_peering: false,
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: false,
                  deleted: false,
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
        } else {
          reject({ m: 'Error' });
        }
      } catch (e) { reject({ m: e }); }
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
            }).count( async (err, c) => {
              if (err) reject({ m: err });
              else if (c > 0) reject({ m: 'We have registered in our system more than one organization with the same name' });
              else {
                data = {
                  name: String(data.name),
                  logo: String(data.logo),
                  notes: String(data.notes),
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
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

  list(usr) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((organization) => {
          organization.aggregate([{
            $match: {
              $and: [
                { uuid: usr },
                { deleted: false },
              ],
            },
          }, {
            $project: {
              uuid: 0,
            },
          }]).toArray((err, rOrganizations) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r: rOrganizations });
          });
        });
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
          }).catch((e) => reject({m: e}));
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
}
module.exports = Organization;
