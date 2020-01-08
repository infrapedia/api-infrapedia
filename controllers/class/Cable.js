const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Cable {
  constructor() {
    this.model = require('../../models/cable.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then( async (cables) => {
            // TODO: check if exist another network with the same name
            const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
            data = {
              uuid: String(user),
              name: String(data.name),
              systemLength: String(data.systemLength),
              activationDateTime: (activationDateTime !== '') ? luxon.DateTime.fromJSDate(activationDateTime).toUTC() : '',
              urls: await (data.urls === '') ? [] : JSON.parse(data.urls),
              terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
              capacityTBPS: String(data.capacityTBPS),
              fiberPairs: String(data.fiberPairs),
              notes: String(data.notes),
              facilities: await (data.facilities === '') ? [] : data.facilities.map((item) => new ObjectID(item)),
              cls: await (data.cls === '') ? [] : data.cls.map((item) => new ObjectID(item)),
              geom: (data.geom !== '') ? JSON.parse(data.geom) : {},
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            cables.insertOne(data, (err, i) => {
              // TODO: validation insert
              if (err) reject({ m: err });
              resolve({ m: 'Cable created' });
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cables) => {
            const id = new ObjectID(data._id);
            const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
            data = {
              uuid: String(user),
              name: String(data.name),
              systemLength: String(data.systemLength),
              activationDateTime: (activationDateTime !== '') ? luxon.DateTime.fromJSDate(activationDateTime).toUTC() : '',
              urls: await (data.urls === '') ? [] : JSON.parse(data.urls),
              terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
              capacityTBPS: String(data.capacityTBPS),
              fiberPairs: String(data.fiberPairs),
              notes: String(data.notes),
              facilities: await (data.facilities === '') ? [] : data.facilities.map((item) => new ObjectID(item)),
              cls: await (data.cls === '') ? [] : data.cls.map((item) => new ObjectID(item)),
              geom: (data.geom !== '') ? JSON.parse(data.geom) : {},
              uDate: luxon.DateTime.utc(),
            };
            // we're going to search if the user is the own of the cable
            cables.find({ _id: id, uuid: String(user) }).count((err, c) => {
              if (err) reject({ m: err });
              cables.updateOne({ _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
                if (err) reject({ m: err });
                else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
                else resolve({ m: 'Loaded', r: data });
              });
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((cables) => {
            cables.aggregate([{
              $match: {
                $and: [
                  { uuid: user },
                  { deleted: false },
                ],
              },
            }, {
              $project: {
                uuid: 0,
              },
            }]).toArray((err, rCables) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rCables });
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
          this.model().then(async (cables) => {
            id = new ObjectID(id);
            // TODO: we need to validate if  don't have another organization with the same name
            cables.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your cable' });
              else {
                cables.updateOne(
                  { _id: id, uuid: String(user) }, { $set: { deleted: true } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your cable' });
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
          this.model().then((cables) => {
            id = new ObjectID(id);
            cables.findOne({ _id: id }, (err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o });
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Cable;
