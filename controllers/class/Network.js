const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Network {
  constructor() {
    this.model = require('../../models/network.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (network) => {
            // TODO: check if exist another network with the same name
            data = {
              uuid: String(user),
              name: String(data.name),
              notes: '', // String(data.notes)
              websites: await (Array.isArray(data.websites)) ? data.websites : [],
              organizations: await (Array.isArray(data.organizations)) ? data.organizations.map((item) => new ObjectID(item)) : [],
              facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
              ixps: await (Array.isArray(data.ixps)) ? data.ixps.map((item) => new ObjectID(item)) : [],
              cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
              cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
              tags: data.tags,
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
          }).catch((e) => { console.log(e); reject({ m: e + 1 }); });
        } else { resolve('Not user found'); }
      } catch (e) { console.log(e); reject({ m: e + 2 }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (network) => {
            const id = new ObjectID(data._id);
            // TODO: check if exist another network with the same name
            data = {
              name: String(data.name),
              websites: await (Array.isArray(data.websites)) ? data.websites : [],
              organizations: await (Array.isArray(data.organizations)) ? data.organizations.map((item) => new ObjectID(item)) : [],
              facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
              ixps: await (Array.isArray(data.ixps)) ? data.ixps.map((item) => new ObjectID(item)) : [],
              cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
              cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
              tags: data.tags,
              uDate: luxon.DateTime.utc(),
            };
            network.updateOne({ _id: id, uuid: String(user) }, { $set: data }, (err, u) => {
              if (err) reject({ m: err });
              resolve({ m: 'Network updated', r: data });
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((network) => {
            network.aggregate([{
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
              $lookup: {
                from: 'organizations',
                let: { orgs: '$organizations' },
                pipeline: [
                  {
                    $addFields: {
                      idsorgs: '$$orgs',
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$idsorgs'],
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
                from: 'cables',
                let: { cables: '$cables' },
                pipeline: [
                  {
                    $addFields: {
                      idscables: '$$cables',
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$idscables'],
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
                from: 'cls',
                let: { cls: '$cls' },
                pipeline: [
                  {
                    $addFields: {
                      idscls: '$$cls',
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$idscls'],
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
              $addFields: { alerts: { $arrayElemAt: ['$alerts.elmnt', 0] } },
            },
            {
              $project: {
                uuid: 0,
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
          this.model().then((network) => {
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
          }).catch((e) => reject({ m: e }));
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
            network.aggregate([
              {
                $match: {
                  _id: id,
                },
              },
              {
                $lookup: {
                  from: 'organizations',
                  let: { f: '$organizations' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ['$_id', '$$f'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        label: '$name',
                        value: '$_id',
                      },
                    },
                    {
                      $project: {
                        label: 1,
                        value: 1,
                      },
                    },
                  ],
                  as: 'organizations',
                },
              },
              {
                $lookup: {
                  from: 'facilities',
                  let: { f: '$facilities' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ['$_id', '$$f'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        label: '$name',
                        value: '$_id',
                      },
                    },
                    {
                      $project: {
                        label: 1,
                        value: 1,
                      },
                    },
                  ],
                  as: 'facilities',
                },
              },
              {
                $lookup: {
                  from: 'cables',
                  let: { f: '$cables' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ['$_id', '$$f'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        label: '$name',
                        value: '$_id',
                      },
                    },
                    {
                      $project: {
                        label: 1,
                        value: 1,
                      },
                    },
                  ],
                  as: 'cables',
                },
              },
              {
                $lookup: {
                  from: 'cls',
                  let: { f: '$cls' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ['$_id', '$$f'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        label: '$name',
                        value: '$_id',
                      },
                    },
                    {
                      $project: {
                        label: 1,
                        value: 1,
                      },
                    },
                  ],
                  as: 'cls',
                },
              },
            ], (err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o });
            });
          });
        } else { resolve('Not user found'); }
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
              $lookup: {
                from: 'organizations',
                let: { orgs: '$organizations' },
                pipeline: [
                  {
                    $addFields: {
                      idsorgs: '$$orgs',
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$idsorgs'],
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
                as: 'orgs',
              },
            },
            {
              $lookup: {
                from: 'cables',
                let: { cables: '$cables' },
                pipeline: [
                  {
                    $addFields: {
                      idscables: '$$cables',
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$idscables'],
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
                from: 'cls',
                let: { cls: '$cls' },
                pipeline: [
                  {
                    $addFields: {
                      idscls: '$$cls',
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', '$idscls'],
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
                from: 'alerts',
                let: { elemnt: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '6' }, { uuid: user }, { disabled: false }] },
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
                uuid: 0,
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
module.exports = Network;
