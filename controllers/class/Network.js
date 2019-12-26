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
          data.websites = JSON.parse(data.websites);
          data.organizations = JSON.parse(data.organizations);
          data.facilities = JSON.parse(data.facilities);
          data.ixps = JSON.parse(data.ixps);
          data.cls = JSON.parse(data.cls);
          data = {
            uuid: String(user),
            name: String(data.name),
            websites: await data.websites.map((item) => new ObjectID(item)),
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
            console.log( err );
            if (err) reject({ m: err })
            resolve({ m: 'Network created' });
          });
        }).catch((e) => {  console.log( e ); reject({ m: e }); });
      } catch (e) { console.log( e );reject({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (network) => {
          const id = new ObjectID(data._id);
          data.websites = JSON.parse(data.websites);
          data.organizations = JSON.parse(data.organizations);
          data.facilities = JSON.parse(data.facilities);
          data.ixps = JSON.parse(data.ixps);
          data.cls = JSON.parse(data.cls);
          data = {
            name: String(data.name),
            websites: await data.websites.map((item) => new ObjectID(item)),
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
              websites: 0,
              organizations: 0,
              facilities: 0,
              ixps: 0,
              cls: 0,
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
