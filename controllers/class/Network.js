const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const { adms } = require('../helpers/adms');

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
              references: (typeof data.references === 'string' && data.references !== '') ? data.references : '',
              facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
              ixps: await (Array.isArray(data.ixps)) ? data.ixps.map((item) => new ObjectID(item)) : [],
              cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
              cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
              tags: data.tags,
              created: data.created,
              aka: data.aka,
              asn: data.asn,
              info_ipv6: data.info_ipv6,
              info_multicast: data.info_multicast,
              info_prefixes4: data.prefixes4,
              info_ratio: data.info_ratio,
              info_scope: data.info_scope,
              info_traffic: data.info_traffic,
              info_type: data.info_type,
              info_unicast: data.info_unicast,
              irr_as_set: data.irr_as_set,
              looking_glass: data.looking_glass,
              policy_contrats: data.policy_contrats,
              policy_general: data.policy_general,
              policy_locations: data.policy_locations,
              policy_ratio: data.policy_ratio,
              policy_url: data.policy_url,
              route_server: data.route_server,
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            network.find({ name: data.name }).count((err, c) => {
              if (err) reject({ m: err + 0 });
              else if (c > 0) reject({ m: 'We have another element with the same name' });
              network.insertOne(data, (err, i) => {
                // TODO: validation insert
                if (err) reject({ m: err });
                resolve({ m: 'Group created' });
              });
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
              references: (typeof data.references === 'string' && data.references !== '') ? data.references : '',
              facilities: await (Array.isArray(data.facilities)) ? data.facilities.map((item) => new ObjectID(item)) : [],
              ixps: await (Array.isArray(data.ixps)) ? data.ixps.map((item) => new ObjectID(item)) : [],
              cls: await (Array.isArray(data.cls)) ? data.cls.map((item) => new ObjectID(item)) : [],
              cables: await (Array.isArray(data.cables)) ? data.cables.map((item) => new ObjectID(item)) : [],
              tags: data.tags,
              aka: data.aka,
              asn: data.asn,
              info_ipv6: data.info_ipv6,
              info_multicast: data.info_multicast,
              info_prefixes4: data.prefixes4,
              info_ratio: data.info_ratio,
              info_scope: data.info_scope,
              info_traffic: data.info_traffic,
              info_type: data.info_type,
              info_unicast: data.info_unicast,
              irr_as_set: data.irr_as_set,
              looking_glass: data.looking_glass,
              policy_contrats: data.policy_contrats,
              policy_general: data.policy_general,
              policy_locations: data.policy_locations,
              policy_ratio: data.policy_ratio,
              policy_url: data.policy_url,
              route_server: data.route_server,
              website: data.website,
              uDate: luxon.DateTime.utc(),
            };
            network.updateOne({ $and: [adms(user), { _id: id }] }, { $set: data }, (err, u) => {
              if (err) reject({ m: err });
              resolve({ m: 'Group updated', r: data });
            });
          }).catch((e) => { reject({ m: e }); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((network) => {
            network.aggregate([
              {
                $sort: { name: 1 },
              }, {
                $match: {
                  $and: [
                    adms(user),
                    // { deleted: false },
                  ],
                },
              },
              { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
              { $limit: limit },
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
              else if (c === 0) reject({ m: 'We cannot delete your group' });
              else {
                network.updateOne(
                  { $and: [adms(user), { _id: id }] }, { $set: { deleted: true, uDate: luxon.DateTime.utc() } }, (err, u) => {
                    if (err) reject({ m: err });
                    else if (u.result.nModified !== 1) resolve({ m: 'We can\'t delete your group' });
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
                        terrestrial: 1,
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
            ]).toArray((err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o[0] });
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
          const uuid = (search.psz === '1') ? adms(user) : {};
          let sortBy = {};
          if (search.sortBy !== undefined || search.sortBy !== '') {
            // eslint-disable-next-line no-unused-vars
            switch (search.sortBy) {
              case 'name':
                sortBy = { name: 1, yours: -1 };
                break;
              case 'creatAt':
                sortBy = { rgDate: 1, yours: -1 };
                break;
              case 'updateAt':
                sortBy = { uDate: 1, yours: -1 };
                break;
              default:
                sortBy = { name: 1, yours: -1 };
                break;
            }
          } else { sortBy = { name: 1, yours: -1 }; }
          cable.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                yours: 1,
                alerts: 1,
                deleted: 1,
                rgDate: 1,
                uDate: 1,
              },
            },
            {
              $match: { $and: [uuid, { name: { $regex: search.s, $options: 'i' } }, { deleted: { $ne: true } }] },
            },
            { $addFields: { yours: { $cond: { if: { $eq: ['$uuid', user] }, then: 1, else: 0 } } } },
            {
              $sort: sortBy,
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
            { $limit: 20 },
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
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$idsorgs'],
                          },
                        },
                        {
                          deleted: false,
                        },
                      ],
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
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$idscables'],
                          },
                        },
                        {
                          deleted: false,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      terrestrial: 1,
                    },
                  },
                ],
                as: 'cables',
              },
            },
            {
              $lookup: {
                from: 'facilities',
                let: { f: '$facilities' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$f'],
                          },
                        },
                        {
                          deleted: false,
                        },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                ],
                as: 'facilities',
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
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$idscls'],
                          },
                        },
                        {
                          deleted: false,
                        },
                      ],
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

  getNameElemnt(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((network) => {
          network.aggregate([
            {
              $project: {
                _id: 1,
                uuid: 1,
                name: 1,
              },
            },
            {
              $match: {
                _id: new ObjectID(id),
              },
            },
          ]).toArray((err, c) => {
            if (err) reject(err);
            resolve(c);
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  getElementGeom(id) {
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
              $project: {
                geom: 1,
              },
            },
          ]).toArray((err, r) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r: r[0].geom });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  checkName(name) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((search) => {
          search.aggregate([
            {
              $project: {
                name: 1,
              },
            },
            {
              $addFields: {
                name: { $toLower: '$name' },
              },
            },
            {
              $match: {
                name: name.toLowerCase(),
              },
            },
          ]).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c.length });
          });
        });
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  permanentDelete(usr, id, code) {
    return new Promise((resolve, reject) => {
      try {
        if (adms(usr) !== {}) {
          if (code === process.env.securityCode) {
            this.model().then((element) => {
              element.deleteOne({ _id: new ObjectID(id), deleted: true }, (err, result) => {
                if (err) reject({ m: err });
                resolve({ m: 'Element deleted' });
              });
            });
          } else {
            reject({ m: 'Permissions denied' });
          }
        } else {
          reject({ m: 'Permissions denied' });
        }
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Network;
