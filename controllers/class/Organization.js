const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const countries = require('../helpers/isoCountries');
const { adms } = require('../helpers/adms');

class Organization {
  constructor() {
    // eslint-disable-next-line global-require
    this.model = require('../../models/organization.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((organization) => {
            // we need to validate if  don't have another organization with the same name
            // TODO: discard deleted files
            organization.find({ name: String(data.name) }).count(async (err, c) => {
              if (err) reject({ m: err });
              else if (c > 0) reject({ m: 'We have registered in our system more than one organization with the same name' });
              else {
                // data.address = JSON.parse(data.address);
                data = {
                  uuid: String(user),
                  name: String(data.name),
                  notes: '', // String(data.notes)
                  logo: String(data.logo),
                  information: String(data.information),
                  // TODO: when array is empty not use the map
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                  url: String(data.url),
                  premium: false,
                  istrusted: false,
                  non_peering: false,
                  tags: [],
                  rgDate: luxon.DateTime.utc(),
                  uDate: luxon.DateTime.utc(),
                  status: false,
                  deleted: false,
                  validated: false,
                };
                // console.log( JSON.stringify( data ) );
                organization.find({ name: data.name }).count((err, c) => {
                  if (err) reject({ m: err + 0 });
                  else if (c > 0) reject({ m: 'We have another element with the same name' });
                  organization.insertOne(data, (err, i) => {
                    // TODO: validation insert
                    if (err) reject({ m: err });
                    resolve({ m: 'Organization created' });
                  });
                });
              }
            });
          }).catch((e) => { reject(e); });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((organization) => {
          // we need to validate if  don't have another organization with the same name
          // TODO: discard deleted files
          console.log(data.name);
          organization.find({ ooid: String(data.ooid) }).count((err, c) => {
            console.log(c);
            if (err) resolve({ m: err });
            else if (c > 0) resolve({ m: 'We have registered in our system more than one organization with the same name' });
            else {
              // data.address = JSON.parse(data.address);
              data = {
                uuid: '',
                ooid: String(data.ooid),
                name: String(data.name),
                notes: '', // String(data.notes)
                logo: (data.logo !== null && data.logo !== '') ? String(data.logo) : '',
                information: '',
                address: [
                  {
                    reference: `${data.address1} ${data.address2}`,
                    street: `${data.address1} ${data.address2}`,
                    apt: '',
                    city: `${data.city}`,
                    state: `${data.state}`,
                    zipcode: `${data.zipcode}`,
                    country: countries(data.country),
                  },
                ],
                url: String(data.url),
                premium: data.premium,
                istrusted: false,
                non_peering: (data.non_peering),
                tags: [],
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
                status: true,
                deleted: false,
                validated: false,
              };
              // console.log( JSON.stringify( data ) );
              organization.insertOne(data, (err, i) => {
                // TODO: validation insert
                if (err) resolve({ m: err });
                resolve({ m: 'Organization created' });
              });
            }
          });
        }).catch((e) => { reject(e); });
      } catch (e) { resolve({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (organization) => {
            const id = new ObjectID(data._id);
            // we need to validate if  don't have another organization with the same name
            organization.find({
              $and:
                 [{ _id: { $ne: id } }, { name: String(data.name) }],
            }).count(async (err, c) => {
              if (err) reject({ m: err });
              else if (c > 0) reject({ m: 'We have registered in our system more than one organization with the same name' });
              else {
                data = {
                  name: String(data.name),
                  logo: String(data.logo),
                  information: String(data.information),
                  address: await (data.address === '') ? [] : data.address.map((item) => JSON.parse(item)),
                  url: String(data.url),
                  tags: [],
                  uDate: luxon.DateTime.utc(),
                };
                organization.updateOne({ $and: [adms(user), { _id: id }] }, { $set: data }, (err, u) => {
                  if (err) reject(err);
                  else if (u.result.nModified !== 1) resolve({ m: 'Not updated' });
                  else resolve({ m: 'Loaded', r: data });
                });
              }
            });
          }).catch((e) => reject(e));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  list(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((organization) => {
            organization.aggregate([
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
                $addFields: { alerts: { $arrayElemAt: ['$alerts.elmnt', 0] } },
              },
              {
                $project: {
                  uuid: 0,
                },
              }]).toArray((err, rOrganizations) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rOrganizations });
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
          this.model().then(async (organization) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            organization.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your organization' });
              else {
                organization.updateOne(
                  { $and: [adms(user), { _id: id }] }, { $set: { deleted: true, uDate: luxon.DateTime.utc() } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We can\'t delete your organization' });
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
          this.model().then((organization) => {
            id = new ObjectID(id);
            organization.findOne({ _id: id }, (err, o) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: o });
            });
          }).catch((e) => reject({ m: e }));
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  // delete(usr, id) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.model().then((organization) => {
  //         // eslint-disable-next-line no-param-reassign
  //         id = new ObjectID(id);
  //         organization.find({ $and: [{ _id: id }, { uuid: usr }] }).count((err, c) => {
  //           if (err) reject(new Error({ m: err }));
  //           else if (c === 0) reject({ m: 'We cannot delete your organization' });
  //           else {
  //             // TODO: we need verify if we have connection in another collections
  //             organization.deleteOne({ _id: id }, (err, d) => {
  //               if (err) reject({ m: err });
  //               resolve({ m: 'Deleted' });
  //             });
  //           }
  //         });
  //       });
  //     } catch (e) { reject({ m: e }); }
  //   });
  // }

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
                logo: 1,
                deleted: 1,
              },
            },
            {
              $addFields: { name: { $toLower: '$name' } },
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
                from: 'networks',
                let: { idorg: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$$idorg', '$organizations'],
                          },
                        },
                        {
                          deleted: false,
                        },
                      ],
                    },
                  },
                  // {
                  //   $lookup: {
                  //     from: 'cables',
                  //     let: { cables: '$cables' },
                  //     pipeline: [
                  //       {
                  //         $addFields: {
                  //           idscables: '$$cables',
                  //         },
                  //       },
                  //       {
                  //         $match: {
                  //           $expr: {
                  //             $in: ['$_id', '$idscables'],
                  //           },
                  //         },
                  //       },
                  //       {
                  //         $project: {
                  //           _id: 1,
                  //           name: 1,
                  //         },
                  //       },
                  //     ],
                  //     as: 'cables',
                  //   },
                  // },
                  // {
                  //   $lookup: {
                  //     from: 'cls',
                  //     let: { cls: '$cls' },
                  //     pipeline: [
                  //       {
                  //         $addFields: {
                  //           idscls: '$$cls',
                  //         },
                  //       },
                  //       {
                  //         $match: {
                  //           $expr: {
                  //             $in: ['$_id', '$idscls'],
                  //           },
                  //         },
                  //       },
                  //       {
                  //         $project: {
                  //           _id: 1,
                  //           name: 1,
                  //         },
                  //       },
                  //     ],
                  //     as: 'cls',
                  //   },
                  // },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      // cls: 1,
                      // cables: 1,
                    },
                  },
                ],
                as: 'networks',
              },
            },
            {
              $lookup: {
                from: 'alerts',
                let: { elemnt: { $toString: '$_id' } },
                pipeline: [
                  {
                    $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '7' }, { uuid: user }, { disabled: false }] },
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
        this.model().then((organization) => {
          organization.aggregate([
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

  partners() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((organizations) => {
          organizations.aggregate([
            {
              $project:
                {
                  _id: 1, name: 1, logo: 1, premium: 1,
                },
            },
            { $match: { premium: true } },
            { $sort: { name: 1 } },
          ]).toArray((err, r) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r });
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }

  istrusted() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((organizations) => {
          organizations.aggregate([
            { $match: { istrusted: true } },
            { $project: { _id: 1, name: 1, logo: 1 } },
            { $sort: { name: 1 } }]).toArray((err, r) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r });
          });
        }).catch((e) => reject({ m: e }));
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

  associationsGroups(id) {
    return new Promise((resolve, reject) => {
      try {
        const network = require('../../models/network.model');
        network().then((associations) => {
          associations.aggregate([
            {
              $project: {
                name: 1,
                organizations: 1,
              },
            },
            {
              $match: {
                owners: { $in: [new ObjectID(id), '$organizations'] },
              },
            },
            {
              $project: {
                _id: '$_id',
                label: '$name',
              },
            },
          ], { allowDiskUse: true }).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        }).catch((e) => { reject({ m: e })});
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  associationsCLS(id) {
    return new Promise((resolve, reject) => {
      try {
        const cls = require('../../models/cls.model');
        cls().then((associations) => {
          associations.aggregate([
            {
              $project: {
                name: 1,
                owners: 1,
              },
            },
            {
              $match: {
                owners: { $in: [new ObjectID(id), '$owners'] },
              },
            },
            {
              $project: {
                _id: '$_id',
                label: '$name',
              },
            },
          ], { allowDiskUse: true }).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        }).catch((e) => { reject({ m: e })});
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  associationsSubseas(id) {
    return new Promise((resolve, reject) => {
      try {
        const cable = require('../../models/cable.model');
        cable().then((associations) => {
          associations.aggregate([
            {
              $project: {
                name: 1,
                owners: 1,
              },
            },
            {
              $match: {
                owners: { $in: [new ObjectID(id), '$owners'] },
              },
            },
            {
              $project: {
                _id: '$_id',
                label: '$name',
              },
            },
          ], { allowDiskUse: true }).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        }).catch((e) => { reject({ m: e })});
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  associationsSubseasKU(id) {
    return new Promise((resolve, reject) => {
      try {
        const cable = require('../../models/cable.model');
        cable().then((associations) => {
          associations.aggregate([
            {
              $project: {
                name: 1,
                knownUsers: 1,
              },
            },
            {
              $addFields: { knownUsers: { $ifNull: ['$knownUsers', []] } },
            },
            {
              $match: {
                owners: { $in: [new ObjectID(id), '$knownUsers'] },
              },
            },
            {
              $project: {
                _id: '$_id',
                label: '$name',
              },
            },
          ], { allowDiskUse: true }).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        }).catch((e) => { reject({ m: e })});
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  associationsTerrestrials(id) {
    return new Promise((resolve, reject) => {
      try {
        const cable = require('../../models/cable.model');
        cable().then((associations) => {
          associations.aggregate([
            {
              $project: {
                name: 1,
                owners: 1,
              },
            },
            {
              $match: {
                owners: { $in: [new ObjectID(id), '$owners'] },
              },
            },
            {
              $project: {
                _id: '$_id',
                label: '$name',
              },
            },
          ], { allowDiskUse: true }).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        }).catch((e) => { reject({ m: e })});
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  associationsIXPS(id) {
    return new Promise((resolve, reject) => {
      try {
        const ixps = require('../../models/ixp.model');
        ixps().then((associations) => {
          associations.aggregate([
            {
              $project: {
                name: 1,
                owners: 1,
              },
            },
            {
              $match: {
                owners: { $in: [new ObjectID(id), '$owners'] },
              },
            },
            {
              $project: {
                _id: '$_id',
                label: '$name',
              },
            },
          ], { allowDiskUse: true }).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        }).catch((e) => { reject({ m: e })});
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  associationsFacilities(id) {
    return new Promise((resolve, reject) => {
      try {
        const facility = require('../../models/facility.model');
        facility().then((associations) => {
          associations.aggregate([
            {
              $project: {
                name: 1,
                owners: 1,
              },
            },
            {
              $match: {
                owners: { $in: [new ObjectID(id), '$owners'] },
              },
            },
            {
              $project: {
                _id: '$_id',
                label: '$name',
              },
            },
          ], { allowDiskUse: true }).toArray((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        }).catch((e) => { reject({ m: e })});
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
module.exports = Organization;
