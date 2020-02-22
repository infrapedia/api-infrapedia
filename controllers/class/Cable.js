const luxon = require('luxon');
const GJV = require('geojson-validation');
const fs = require('fs');
// const geojsonHint = require('@mapbox/geojsonhint');

const { ObjectID } = require('mongodb');

class Cable {
  constructor() {
    this.model = require('../../models/cable.model');
  }

  add(user, data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cables) => {
            // create file
            const stream = await fs.createWriteStream('./temp/t_cable.json');
            stream.write(data.geom);
            stream.end(async () => {
              const rd = await fs.readFileSync('readMe.txt', 'utf8');
              const activationDateTime = (data.activationDateTime !== '') ? new Date(data.activationDateTime) : '';
              let geomData;
              rd.on('data', async (err, chunk) => { geomData += await chunk; });
              rd.on('end', async () => {
                data = {
                  uuid: String(user),
                  name: String(data.name),
                  notes: '', // String(data.notes)
                  systemLength: String(data.systemLength),
                  activationDateTime: (activationDateTime !== '') ? luxon.DateTime.fromJSDate(activationDateTime).toUTC() : '',
                  urls: (Array.isArray(data.urls)) ? data.urls : [],
                  terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
                  capacityTBPS: String(data.capacityTBPS),
                  fiberPairs: String(data.fiberPairs),
                  category: String(data.category),
                  facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
                  geom: (geomData !== '') ? JSON.parse(geomData) : {},
                  tags: data.tags,
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: false,
                  deleted: false,
                };
                cables.insertOne(data, (err, i) => {
                  // TODO: validation insert
                  if (err) reject({ m: err + 0 });
                  resolve({ m: 'Cable created' });
                });
              });
            });
          }).catch((e) => reject({ m: e + 1 }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e + 2 }); }
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
              urls: (data.urls === '') ? data.urls : [],
              terrestrial: (data.terrestrial === 'True' || data.terrestrial === 'true'),
              capacityTBPS: String(data.capacityTBPS),
              fiberPairs: String(data.fiberPairs),
              // notes: String(data.notes),
              category: String(data.category),
              facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
              // cls: await (data.cls.length === 0 || data.cls === '') ? [] : data.cls.map((item) => new ObjectID(item)),
              geom: (data.geom !== '') ? JSON.parse(data.geom) : {},
              tags: data.tags,
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
            // if (GJV.isMultiLineString(data.geom) || GJV.isLineString(data.geom)) {
            //
            // } else { reject({ m: 'You must send a validated geojson, lines or multilines' }); }
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
                geom: 0,
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

  shortList(user) {
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
                _id: 1,
                name: 1,
                category: 1,
                status: 1,
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

  bbox(user, id) {
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
              $addFields: {
                coordinates: { $map: { input: '$geom.features.geometry.coordinates', as: 'feature', in: '$$feature' } },
              },
            },
            {
              $addFields: {
                v: { $arrayElemAt: ['$geom.features.geometry.coordinates', 0] },
                b: { $arrayElemAt: ['$geom.features.geometry.coordinates', -1] },
              },
            },
            {
              $project: {
                _id: 1,
                coordinates: [{ $arrayElemAt: ['$v', 0] }, { $arrayElemAt: ['$b', -1] }],
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
              $project: { geom: 0 },
            },
            {
              $lookup: {
                from: 'cls',
                let: { cables: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$$cables', '$cables'],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                ],
                as: 'cls',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: { cable: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$$cable', '$cables'],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      organizations: 1,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $lookup: {
                from: 'organizations',
                let: { networks: '$networks' },
                pipeline: [
                  {
                    $addFields: {
                      idsorgs: { $map: { input: '$$networks.organizations', as: 'orgs', in: '$$orgs' } },
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', {
                          $cond: {
                            if: { $isArray: { $arrayElemAt: ['$idsorgs', 0] } },
                            then: { $arrayElemAt: ['$idsorgs', 0] },
                            else: [],
                          },
                        },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                ],
                as: 'organizations',
              },
            },
            {
              $lookup: {
                from: 'alerts',
                let: { elemnt: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '1' }, { uuid: user }, { disabled: false }] },
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
                geom: 0,
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
}
module.exports = Cable;
