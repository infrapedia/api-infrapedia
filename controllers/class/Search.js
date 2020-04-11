const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Search {
  constructor() {
    this.model = require('../../models/organization.model');
  }

  organizations(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/organization.model');
        this.model().then((organization) => {
          organization.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                premium: 1,
                deleted: 1,
                'address.city': 1,
                'address.state': 1,
              },
            },
            {
              $match: {
                $and: [
                  { deleted: false },
                  {
                    $or: [
                      { _id: { $regex: search, $options: 'i' } },
                      { name: { $regex: search, $options: 'i' } },
                      { 'address.state': { $regex: search, $options: 'i' } },
                      { 'address.city': { $regex: search, $options: 'i' } },
                    ],
                  },
                ],
              },
            },
            { $limit: 10 },
            { $sort: { name: 1 } },
            // {
            //   $project: {
            //     _id: 1,
            //     name: 1,
            //     premium: 1,
            //     'address.city': 1,
            //     'address.state': 1,
            //     t: 'org',
            //   },
            // },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  networks(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/network.model');
        this.model().then((network) => {
          network.aggregate([
            {
              $project: {
                id: 1,
                name: 1,
                deleted: 1,
                address: 1,
              },
            },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      { 'address.city': { $regex: search, $options: 'i' } },
                      { 'address.state': { $regex: search, $options: 'i' } },
                      { name: { $regex: search, $options: 'i' } },
                    ],
                  },
                  {
                    deleted: false,
                  },
                ],
              },
            },
            { $limit: 10 },
            {
              $lookup: {
                from: 'organizations',
                let: { orgs: '$organizations' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      premium: 1,
                      city: '$address.city',
                      state: '$address.state',
                      deleted: 1,
                    },
                  },
                  {
                    $match: {
                      $and: [{
                        $expr: {
                          $in: ['$_id', '$$orgs'],
                        },
                      }, { deleted: false }],

                    },
                  },
                  {
                    $unwind: '$address',
                  },
                  {
                    $match: {
                      $or: [
                        { 'address.city': { $regex: search, $options: 'i' } },
                        { 'address.state': { $regex: search, $options: 'i' } },
                      ],
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      premium: 1,
                      city: '$address.city',
                      state: '$address.state',
                    },
                  },
                ],
                as: 'address',
              },
            },
            { $sort: { name: 1 } },
            {
              $project: {
                id: 1,
                name: 1,
                address: 1,
                t: 'groups',
              },
            },
            {
              $addFields: {
                premium: { $arrayElemAt: ['$address.premium', 0] },
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  cables(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/cable.model');
        this.model().then((cable) => {
          cable.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                deleted: 1,
                terrestrial: 1,
              },
            },
            {
              $match: { $and: [{ deleted: false }, { name: { $regex: search, $options: 'i' } }] },
            },
            { $limit: 10 },
            {
              $lookup: {
                from: 'networks',
                let: { cable: '$_id' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$$cable', '$cables'],
                      },
                    },
                  },
                ],
                as: 'networks',
              },
            },
            { $sort: { name: 1 } },
            {
              $project: {
                _id: 1,
                name: 1,
                networks: 1,
                terrestrial: 1,
                t: 'cable',
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  cls(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/cls.model');
        this.model().then((cls) => {
          cls.aggregate([
            {
              $project: {
                _id: 1, name: 1, deleted: 1,
              },
            },
            {
              $match: {
                $and: [
                  { name: { $regex: search, $options: 'i' } },
                  {
                    deleted: false,
                  },
                ],
              },
            },
            { $limit: 10 },
            {
              $lookup: {
                from: 'networks',
                let: { cls: '$_id' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$$cls', '$cls'],
                      },
                    },
                  },
                ],
                as: 'networks',
              },
            },
            { $sort: { name: 1 } },
            {
              $project: {
                _id: 1,
                name: 1,
                networks: 1,
                t: 'cls',
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  facility(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/facility.model');
        this.model().then((facility) => {
          console.log(search);
          facility.aggregate([
            {
              $project: {
                _id: 1, name: 1,
              },
            },
            {
              $match: {
                $and: [{ name: { $regex: search, $options: 'i' } }],
              },
            },
            { $limit: 10 },
            {
              $lookup: {
                from: 'networks',
                let: { facility: '$_id' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      facilities: 1,
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$$facility', '$facilities'],
                      },
                    },
                  },
                ],
                as: 'networks',
              },
            },
            { $sort: { name: 1 } },
            {
              $project: {
                _id: 1,
                name: 1,
                networks: 1,
                t: 'facility',
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  ixps(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/ixp.model');
        this.model().then((ixp) => {
          ixp.aggregate([
            {
              $project: {
                _id: 1, name: 1, nameLong: 1
              },
            },
            {
              $match: {
                $or: [{ name: { $regex: search, $options: 'i' } }, { nameLong: { $regex: search, $options: 'i' } }],
              },
            },
            { $limit: 10 },
            {
              $lookup: {
                from: 'networks',
                let: { ixps: '$_id' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      deleted: 1,
                    },
                  },
                  {
                    $match: {
                      $and: [{
                        $expr: {
                          $in: ['$$ixps', '$ixps'],
                        },
                      }, { deleted: false }],
                    },
                  },
                ],
                as: 'networks',
              },
            },
            { $sort: { name: 1 } },
            {
              $addFields: { name: { $concat: ['$name', ' (', '$nameLong', ')'] } },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                networks: 1,
                t: 'ixps',
              },
            },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byField(user, data) {
    return new Promise((resolve, reject) => {
      try {
        Promise.all([this.organizations(data), this.networks(data), this.cables(data), this.cls(data), this.ixps(data), this.facility(data)]).then(async (r) => {
          resolve(await r.reduce((total, value) => total.concat(value), []));
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldCables(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.cables(data).then((r) => {
          resolve(r);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldCls(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.cls(data).then((r) => {
          resolve(r);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldNetworks(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.networks(data).then((r) => {
          resolve(r);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldOrgs(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.organizations(data).then((r) => {
          resolve(r);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldFacility(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.facility(data).then((r) => {
          resolve(r);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldIXP(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.ixps(data).then((r) => {
          resolve(r);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Search;
