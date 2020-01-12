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
              $match: {
                $or: [
                  { _id: { $regex: search, $options: 'i' } },
                  { name: { $regex: search, $options: 'i' } },
                  { 'address.state': { $regex: search, $options: 'i' } },
                  { 'address.city': { $regex: search, $options: 'i' } },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                premium: 1,
                'address.city': 1,
                'address.state': 1,
                t: 'org',
              },
            },
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
                    $unwind: '$address',
                  },
                  // {
                  //   $unwind: "$state"
                  // },
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
            {
              $project: {
                id: 1,
                name: 1,
                address: 1,
                t: 'networks',
              },
            },
            {
              $match: {
                $or: [
                  { 'address.city': { $regex: search, $options: 'i' } },
                  { 'address.state': { $regex: search, $options: 'i' } },
                  { name: { $regex: search, $options: 'i' } },
                ],
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
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $match: { name: { $regex: search, $options: 'i' } },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                networks: 1,
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
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $match: { name: { $regex: search, $options: 'i' } },
            },
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

  byField(user, data) {
    return new Promise((resolve, reject) => {
      try {
        Promise.all([this.organizations(data), this.networks(data), this.cables(data), this.cls(data)]).then( async (r) => {
          resolve({
            m: 'loaded',
            r: await r.reduce((total, value) => total.concat(value), []),
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldCables(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.cables(data).then((r) => {
          resolve({
            m: 'loaded',
            r,
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldCls(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.cls(data).then((r) => {
          resolve({
            m: 'loaded',
            r,
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldNetworks(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.networks(data).then((r) => {
          resolve({
            m: 'loaded',
            r,
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  byFieldOrgs(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.organizations(data).then((r) => {
          resolve({
            m: 'loaded',
            r,
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Search;
