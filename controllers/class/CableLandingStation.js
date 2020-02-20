const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class CLS {
  constructor() {
    this.model = require('../../models/cls.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cls) => {
            // TODO: check if exist another cls with the same name
            data = {
              uuid: String(user),
              name: data.name,
              notes: '', // String(data.notes)
              state: data.state,
              slug: data.slug,
              geom: (data.geom !== '') ? JSON.parse(data.geom) : {},
              cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
              tags: data.tags,
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            cls.insertOne(data, (err, i) => {
              // TODO: validation insert
              if (err) reject({ m: err });
              resolve({ m: 'CLS created' });
            });
          }).catch((e) => { console.log(e); reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (cls) => {
            const id = new ObjectID(data._id);
            // we need to validate if  don't have another organization with the same name
            cls.find({
              $and:
                 [{ _id: { $ne: id } }, { name: String(data.name) }],
            }).count(async (err, c) => {
              // if (err) reject({ m: err });
              // else if (c > 0) reject({ m: 'We have registered in our system more than one cls with the same name' });
              // else {
              //
              // }
              // TODO: validate the numbers of cls with the same name
              data = {
                name: data.name,
                state: data.state,
                slug: data.slug,
                geom: (data.geom !== '') ? JSON.parse(data.geom) : {},
                cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
                tags: data.tags,
                uDate: luxon.DateTime.utc(),
              };
              cls.updateOne(
                { _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
                  if (err) reject(err);
                  else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
                  else resolve({ m: 'Loaded', r: data });
                },
              );
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
          this.model().then((cls) => {
            cls.aggregate([{
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
                cables: 0,
                deleted: 0,
              },
            }]).toArray((err, rNetwork) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rNetwork });
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
          this.model().then(async (cls) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            cls.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your CLS' });
              else {
                cls.updateOne(
                  { _id: id, uuid: String(user) }, { $set: { deleted: true } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your cls' });
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
          this.model().then((cls) => {
            id = new ObjectID(id);
            cls.findOne({ _id: id }, (err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  bbox(user, id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cls) => {
          cls.aggregate([
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
        this.model().then((cls) => {
          cls.aggregate([
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
                from: 'cables',
                let: { cables: '$cables' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$$cables'],
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
                as: 'cables',
              },
            },
            {
              $lookup: {
                from: 'networks',
                let: { cls: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$$cls', '$cls'],
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
                    $addFields: {
                      norgs: { $size: '$idsorgs' },
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', { $cond: { if: { $eq: ['$norgs', 0] }, then: [], else: { $arrayElemAt: ['$idsorgs', 0] } } }],
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
                    $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '2' }, { uuid: user }, { disabled: false }] },
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
module.exports = CLS;
