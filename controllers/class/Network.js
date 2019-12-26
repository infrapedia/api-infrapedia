const luxon = require('luxon')
const { ObjectID } = require('mongodb');

class Network {
  constructor() {
    this.model = require('../../models/network.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (network) => {
          data = {
            uuid: String(user),
            name: String(data.name),
            websites: data.websites,
            organizations: await data.organizations.map((item) => new ObjectID(item)),
            facilities: await data.facilities.map((item) => new ObjectID(item)),
            ixps: await data.ixps.map((item) => new ObjectID(item)),
            cls: await data.cls.map((item) => new ObjectID(item)),
            rgDate: luxon.DateTime.utc(),
            uDate: luxon.DateTime.utc(),
            status: false,
            deleted: false,
          }
          network.insertOne(data, (err, i) => {
            console.log( data );
            if (err) reject({ m: err })
            resolve({ m: 'Network created' });
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (network) => {
          const id = new ObjectID(data._id);
          data = {
            name: String(data.name),
            websites: data.websites,
            organizations: await data.organizations.map((item) => new ObjectID(item)),
            facilities: await data.facilities.map((item) => new ObjectID(item)),
            ixps: await data.ixps.map((item) => new ObjectID(item)),
            cls: await data.cls.map((item) => new ObjectID(item)),
            uDate: luxon.DateTime.utc(),
          }
          network.updateOne({ _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
            if (err) reject({ m: err })
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
              uuid: usr,
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
}
module.exports = Network
