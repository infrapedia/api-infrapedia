const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Network {
  constructor() {
    this.model = require('../../models/network.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (network) => {
          // TODO: check if exist another network with the same name
          data = {
            uuid: String(user),
            name: String(data.name),
            websites: await (data.websites === '') ? [] : data.websites,
            organizations: await (data.organizations === '') ? [] : data.organizations.map((item) => new ObjectID(item)),
            facilities: await (data.facilities === '') ? [] : data.facilities.map((item) => new ObjectID(item)),
            ixps: await (data.ixps === '') ? [] : data.ixps.map((item) => new ObjectID(item)),
            cls: await (data.cls === '') ? [] : data.cls.map((item) => new ObjectID(item)),
            cables: await (data.cables === '') ? [] : data.cables.map((item) => new ObjectID(item)),
            rgDate: luxon.DateTime.utc(),
            uDate: luxon.DateTime.utc(),
            status: false,
            deleted: false,
          };
          network.insertOne(data, (err, i) => {
            // TODO: validation insert
            if (err) reject({ m: err });
            resolve({ m: 'Network created' });
          });
        }).catch((e) => { console.log(e); reject({ m: e }); });
      } catch (e) { console.log(e); reject({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (network) => {
          const id = new ObjectID(data._id);
          // TODO: check if exist another network with the same name
          data = {
            name: String(data.name),
            websites: await (data.websites === '') ? [] : data.websites,
            organizations: await (data.organizations === '') ? [] : data.organizations.map((item) => new ObjectID(item)),
            facilities: await (data.facilities === '') ? [] : data.facilities.map((item) => new ObjectID(item)),
            ixps: await (data.ixps === '') ? [] : data.ixps.map((item) => new ObjectID(item)),
            cls: await (data.cls === '') ? [] : data.cls.map((item) => new ObjectID(item)),
            cables: await (data.cables === '') ? [] : data.cables.map((item) => new ObjectID(item)),
            uDate: luxon.DateTime.utc(),
          };
          network.updateOne({ _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
            if (err) reject({ m: err });
            resolve({ m: 'Network updated', r: data });
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  list(usr) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((network) => {
          network.aggregate([{
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
          }]).toArray((err, rNetwork) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r: rNetwork });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  delete(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then( (network) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            network.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your organization' });
              else {
                network.updateOne(
                  { _id: id, uuid: String(user) }, { $set: { deleted: true } }, (err, u) => {
                    if (err) reject({ m: err });
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your network' });
                    else resolve({ m: 'Deleted' });
                  },
                );
              }
            });
          }).catch((e) =>reject({ m: e }));
        } else { resolve({ m: 'Not user found' }); }
      } catch (e) { reject({ m: 'error2' }); }
    });
  }

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((network) => {
            id = new ObjectID(id);
            network.findOne({ _id: id }, (err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Network;
