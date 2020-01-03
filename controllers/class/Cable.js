const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Cable {
  constructor() {
    this.model = require('../../models/cable.model');
  }

  add(user, data) {
    return new Promise((resolve,reject) => {
      try {
        this.model().then(async (cables) => {
          // TODO: check if exist another network with the same name
          const activationDateTime = (data.activationDateTime) ? new Date(data.activationDateTime) : '';
          data = {
            uuid: String(user),
            name: String(data.name),
            systemLength: String(data.systemLength),
            activationDateTime: (activationDateTime === '') ? luxon.DateTime.fromJSDate(activationDateTime).toUTC() : '',
            urls: await (data.websites === '') ? [] : data.websites,
            terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
            capacityTBPS: String(data.capacityTBPS),
            fiberPairs: String(data.fiberPairs),
            notes: String(data.notes),
            facilities: await (data.facilities === '') ? [] : data.facilities.map((item) => new ObjectID(item)),
            cls: await (data.cls === '') ? [] : data.cls.map((item) => new ObjectID(item)),
            geometry: (data.geom !== '') ? JSON.parse(data.geom) : {},
            rgDate: luxon.DateTime.utc(),
            uDate: luxon.DateTime.utc(),
            status: false,
            deleted: false,
          };
          cables.insertOne(data, (err, i) => {
            // TODO: validation insert
            if (err) reject({ m: err });
            resolve({ m: 'Network created' });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Cable;