const luxon = require('luxon')
const { ObjectID } = require('mongodb');

class Organization {
  constructor() {
    // eslint-disable-next-line global-require
    this.model = require('../../models/organization.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (organization) => {
          data.address = JSON.parse(data.address);
          data = {
            uuid: String(user),
            name: String(data.name),
            notes: String(data.notes),
            address: data.address,
            premium: (data.premium === 'true' || data.premium === 'True'),
            non_peering: (data.non_peering === 'true' || data.non_peering === 'True'),
            rgDate: luxon.DateTime.utc(),
            uDate: luxon.DateTime.utc(),
            status: false,
          }
          organization.insertOne(data, (err, i) => {
            if (err) reject(err)
            resolve('Organization created');
          });
        }).catch((e) => { reject(e); });
      } catch (e) { reject(e); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (organization) => {
            const id = new ObjectID(data._id);
            data.address = JSON.parse(data.address)
            data={
              name: String(data.name),
              notes: String(data.notes),
              address: data.address,
              premium: (data.premium === 'true' || data.premium === 'True'),
              non_peering: (data.non_peering === 'true' || data.non_peering === 'True'),
              uDate: luxon.DateTime.utc(),
            };
            // eslint-disable-next-line no-underscore-dangle
            organization.updateOne(
              { _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
                if (err) reject(err)
                else if (u.result.nModified !== 1) resolve('Not updated')
                else resolve(data);
              });
          }).catch((e) => reject(e));
        } else { resolve('Not user found'); }
      } catch (e) { reject(e); }
    });
  }
}
module.exports = Organization
