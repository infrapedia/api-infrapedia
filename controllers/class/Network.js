const luxon = require('luxon')
const { ObjectID } = require('mongodb');

class Network {
  constructor() {
    this.model = require('../../models/network.model');
  }

  add(user, data) {
    return new Promise( (resolve, reject) => {
      try {
        this.model().then(async (network) => {
          data = {
            uuid: String(user),
            name: String(data.name),
            websites: data.websites,
            organizations: await data.organizations.map((item) => new ObjectID(item)),
            facilities: [],
            ixps: [],
            cls: [],
            rgDate: luxon.DateTime.utc(),
            uDate: luxon.DateTime.utc(),
            status: false,
          }
          network.insertOne(data, (err, i) => {
            if (err) reject(err)
            resolve('Network created');
          });
        }).catch((e) => { reject(e); });
      } catch (e) { reject(e); }
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
            uDate: luxon.DateTime.utc(),
          }
          network.updateOne({ _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
            if (err) reject(err)
            resolve('Network updated');
          });
        }).catch((e) => { reject(e); });
      } catch (e) { reject(e); }
    });
  }
}
module.exports = Network
