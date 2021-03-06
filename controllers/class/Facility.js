const luxon = require('luxon');
const GJV = require('geojson-validation');
const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');
const countries = require('../helpers/isoCountries');
const slugToString = require('../helpers/slug');

const { adms } = require('../helpers/adms');


class Facility {
  constructor() {
    this.model = require('../../models/facility.model');
  }

  add(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (facility) => {
          if (data) {
            const element = {
              uuid: user,
              name: String(data.name),
              slug: slugToString(data.name),
              point: {},
              address: (Array.isArray(data.address)) ? await data.address.map((address) => JSON.parse(address)) : [],
              website: data.website,
              geom: JSON.parse(data.geom),
              ixps: (Array.isArray(data.ixps)) ? await data.ixps.map((ixp) => new ObjectID(ixp)) : (data.ixps !== '') ? await Object.keys(data.ixps).map((key) => new ObjectID(data.ixps[key])) : [],
              terrestrials: (Array.isArray(data.terrestrials)) ? await data.terrestrials.map((terrestrial) => new ObjectID(terrestrial)) : (data.terrestrials !== '') ? await Object.keys(data.terrestrials).map((key) => new ObjectID(data.terrestrials[key])) : [],
              subsea: (Array.isArray(data.subsea)) ? await data.subsea.map((subsea) => new ObjectID(subsea)) : (data.subsea !== '') ? await Object.keys(data.subsea).map((key) => new ObjectID(data.subsea[key])) : [],
              csp: (Array.isArray(data.csp)) ? await data.csp.map((csp) => new ObjectID(csp)) : (data.ixps !== '') ? await Object.keys(data.csp).map((key) => new ObjectID(data.csp[key])) : [],
              sProviders: (Array.isArray(data.sProviders)) ? await data.sProviders.map((sProvider) => new ObjectID(sProvider)) : (data.sProviders !== '') ? await Object.keys(data.sProviders).map((key) => new ObjectID(data.sProviders[key])) : [],
              tags: data.tags,
              t: data.t,
              StartDate: String(data.StartDate),
              building: String(data.building),
              owners: (Array.isArray(data.owners)) ? await data.owners.map((owner) => new ObjectID(owner)) : [],
              knownUsers: await (Array.isArray(data.knownUsers)) ? data.knownUsers.map((item) => new ObjectID(item)) : [],
              // --- New fields ---
              buildingSize: parseInt(data.buildingSize),
              grossColocationSize: parseInt(data.grossColocationSize),
              floorLoadingCapacity: parseInt(data.floorLoadingCapacity),
              isCarrierNeutral: (data.isCarrierNeutral),
              isLoadingDocks: (data.isLoadingDocks),
              enType: data.enType, //*
              authentication: (data.authentication),
              rackHeight: parseInt(data.rackHeight),
              meetMeRooms: parseInt(data.meetMeRooms),
              platform: String(data.platform),
              totalPower: parseInt(data.totalPower),
              pue: parseFloat(data.pue),
              utilityConnectionRedundancy: String(data.utilityConnectionRedundancy),
              maxRackPower: parseInt(data.maxRackPower),
              backupPowerDuration: parseInt(data.backupPowerDuration),
              backupPowerRedundancy: String(data.backupPowerRedundancy),
              coolingCapacity: parseInt(data.coolingCapacity),
              temperature: JSON.parse(data.temperature),
              humidity: JSON.parse(data.humidity),
              bulletProffGlass: (data.bulletProffGlass === '') ? '' : data.bulletProffGlass,
              cctv: (data.cctv === '') ? '' : data.cctv,
              securityGuards: (data.securityGuards),
              mantrap: (data.mantrap),
              biometric: (data.biometric),
              meetingRooms: (data.meetingRooms),
              breakRooms: (data.breakRooms),
              carParking: (data.carParking),
              spareParts: (data.spareParts),
              stagingRooms: (data.stagingRooms),
              officeSpace: (data.officeSpace),
              internetAccess: (data.internetAccess),
              // --- New fields ---
              fac_id: String(data.fac_id),
              rgDate: luxon.DateTime.utc(),
              uDate: luxon.DateTime.utc(),
              status: false,
              deleted: false,
            };
            facility.find({ name: data.name }).count((err, c) => {
              if (err) reject({ m: err + 0 });
              else if (c > 0) reject({ m: 'We have another element with the same name' });
              facility.insertOne(element, async (err, f) => {
                if (err) reject({ m: err + 0 });
                await element.ixps.map((ixp) => this.updateIXPConnection(ixp, new ObjectID(f.insertedId)));
                resolve({ m: 'Facility created', r: f.insertedId });
              });
            });
          } else { reject({ m: 'Error' }); }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  edit(user, data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then(async (facility) => {
          if (data) {
            const element = {
              name: String(data.name),
              slug: slugToString(data.name),
              point: {},
              address: (Array.isArray(data.address)) ? await data.address.map((address) => JSON.parse(address)) : [],
              website: data.website,
              geom: JSON.parse(data.geom),
              ixps: (Array.isArray(data.ixps)) ? await data.ixps.map((ixp) => new ObjectID(ixp)) : (data.ixps !== '') ? await Object.keys(data.ixps).map((key) => new ObjectID(data.ixps[key])) : [],
              terrestrials: (Array.isArray(data.terrestrials)) ? await data.terrestrials.map((terrestrial) => new ObjectID(terrestrial)) : (data.terrestrials !== '') ? await Object.keys(data.terrestrials).map((key) => new ObjectID(data.terrestrials[key])) : [],
              subsea: (Array.isArray(data.subsea)) ? await data.subsea.map((subsea) => new ObjectID(subsea)) : (data.subsea !== '') ? await Object.keys(data.subsea).map((key) => new ObjectID(data.subsea[key])) : [],
              csp: (Array.isArray(data.csp)) ? await data.csp.map((csp) => new ObjectID(csp)) : (data.ixps !== '') ? await Object.keys(data.csp).map((key) => new ObjectID(data.csp[key])) : [],
              sProviders: (Array.isArray(data.sProviders)) ? await data.sProviders.map((sProvider) => new ObjectID(sProvider)) : (data.sProviders !== '') ? await Object.keys(data.sProviders).map((key) => new ObjectID(data.sProviders[key])) : [],
              tags: data.tags,
              t: data.t,
              StartDate: String(data.StartDate),
              building: String(data.building),
              owners: (Array.isArray(data.owners)) ? await data.owners.map((owner) => new ObjectID(owner)) : [],
              knownUsers: await (Array.isArray(data.knownUsers)) ? data.knownUsers.map((item) => new ObjectID(item)) : [],
              // --- New fields ---
              buildingSize: parseInt(data.buildingSize),
              grossColocationSize: parseInt(data.grossColocationSize),
              floorLoadingCapacity: parseInt(data.floorLoadingCapacity),
              isCarrierNeutral: (data.isCarrierNeutral),
              isLoadingDocks: (data.isLoadingDocks),
              enType: data.enType, //*
              authentication: (data.authentication),
              rackHeight: parseInt(data.rackHeight),
              meetMeRooms: parseInt(data.meetMeRooms),
              platform: String(data.platform),
              totalPower: parseInt(data.totalPower),
              pue: parseFloat(data.pue),
              utilityConnectionRedundancy: String(data.utilityConnectionRedundancy),
              maxRackPower: parseInt(data.maxRackPower),
              backupPowerDuration: parseInt(data.backupPowerDuration),
              backupPowerRedundancy: String(data.backupPowerRedundancy),
              coolingCapacity: parseInt(data.coolingCapacity),
              temperature: JSON.parse(data.temperature),
              humidity: JSON.parse(data.humidity),
              bulletProffGlass: (data.bulletProffGlass === '') ? '' : data.bulletProffGlass,
              cctv: (data.cctv === '') ? '' : data.cctv,
              securityGuards: (data.securityGuards),
              mantrap: (data.mantrap),
              biometric: (data.biometric),
              meetingRooms: (data.meetingRooms),
              breakRooms: (data.breakRooms),
              carParking: (data.carParking),
              spareParts: (data.spareParts),
              stagingRooms: (data.stagingRooms),
              officeSpace: (data.officeSpace),
              internetAccess: (data.internetAccess),
              // --- New fields ---
              fac_id: String(data.fac_id),
              uDate: luxon.DateTime.utc(),
              deleted: false,
            };

            facility.findOne({ _id: new ObjectID(data._id) }, async (err, c) => {
              // Founds IXPS
              c.ixps = await c.ixps.map((ixp) => String(ixp));
              const ixpNotFounds = await (Array.isArray(data.ixps) && c.ixps !== undefined) ? c.ixps.filter((f) => !data.ixps.includes(f)) : [];
              await ixpNotFounds.map((ixp) => this.removeIxpConnection(ixp, data._id));
              // Found Subsea&Terrestrial
              let cables = (c.subsea) ? data.subsea.concat(data.terrestrials) : [];
              let cablesSaved = (c.subsea) ? c.subsea.concat(c.terrestrials) : [];
              cables = (cables) ? await cables.map((cable) => String(cable)) : [];
              cablesSaved = (cablesSaved) ? await cablesSaved.map((cable) => String(cable)) : [];
              const cablesNotFounds = await (Array.isArray(cables) && cablesSaved !== undefined) ? cablesSaved.filter((f) => !cables.includes(f)) : [];
              await cablesNotFounds.map((cable) => this.removeCableConnection(cable, data._id));

              facility.updateOne({ $and: [adms(user), { _id: new ObjectID(data._id) }] }, { $set: element }, async (err, f) => {
                if (err) reject({ m: err + 0 });
                await element.ixps.map((ixp) => this.updateIXPConnection(ixp, new ObjectID(data._id)));
                await element.subsea.map((subsea) => this.updateCableConnection(subsea, new ObjectID(data._id)));
                await element.terrestrials.map((terrestrial) => this.updateCableConnection(terrestrial, new ObjectID(data._id)));
                resolve({ m: 'Facility edited', r: data._id });
              });
            });
          } else { reject({ m: 'Error' }); }
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }

  removeCableConnection(idCable, idFacility) {
    try {
      const cable = require('../../models/cable.model');
      cable().then((cable) => {
        cable.updateOne({ _id: new ObjectID(idCable) }, { $pull: { facilities: new ObjectID(idFacility) } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 2';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  removeIxpConnection(idIxp, idFacility) {
    try {
      const ixp = require('../../models/ixp.model');
      ixp().then((ixp) => {
        ixp.updateOne({ _id: new ObjectID(idIxp) }, { $pull: { facilities: new ObjectID(idFacility) } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 2';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) {
      return e;
    }
  }

  updateCableConnection(idCable, idFacility) {
    try {
      const cable = require('../../models/cable.model');
      cable().then((cable) => {
        cable.updateOne({ _id: new ObjectID(idCable) }, { $addToSet: { facilities: idFacility } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 1';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) { reject({ m: e }); }
  }

  updateIXPConnection(idIxp, idFacility) {
    try {
      const ixp = require('../../models/ixp.model');
      ixp().then((ixp) => {
        ixp.updateOne({ _id: new ObjectID(idIxp) }, { $addToSet: { facilities: idFacility } }, (err, u) => {
          if (err) return err;
          if (u.result.nModified !== 1) return 'Not updated 1';
          return 'Removed';
        });
      }).catch((e) => (e));
    } catch (e) { reject({ m: e }); }
  }

  clusterIxpConnection(idFacility) {
    return new Promise((resolve, reject) => {
      try {
        redisClient.redisClient.get(`v_cluster_facility_${idFacility}`, (err, reply) => {
          if (err) reject({ m: err });
          else if (reply) resolve(((JSON.parse(reply))));
          else {
            this.model().then((facilities) => {
              facilities.aggregate(
                [
                  {
                    $project: {
                      name: 1,
                      point: 1,
                      ixps: 1,
                    },
                  },
                  {
                    $match: {
                      $and: [
                        { _id: new ObjectID(idFacility) }, { point: { $ne: {} } }, // { point: { $ne: {} } }, //{ ixps: { $ne: [] } },
                      ],
                    },
                  },
                  {
                    $lookup: {
                      from: 'ixps',
                      let: { f: '$ixps' },
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            geom: 1,
                            name: 1,
                          },
                        },
                        {
                          $match: { $expr: { $in: ['$_id', '$$f'] } },
                        },
                      ],
                      as: 'ixps',
                    },
                  },
                  {
                    $unwind: { path: '$ixps', preserveNullAndEmptyArrays: false },
                  },
                  {
                    $group: {
                      _id: '$_id',
                      name: { $first: '$name' },
                      point: {
                        $first: '$point',
                      },
                      features: {
                        $push: {
                          type: 'feature',
                          properties: {
                            name: '$ixps.name',
                            type: 'ixp',
                            _id: '$ixps._id',
                          },
                          geometry: '$ixps.geom',
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      type: 'FeatureCollection',
                      features: { $concatArrays: ['$features', [{ type: 'feature', properties: { name: '$name', type: 'facility', _id: '$_id' }, geom: '$point' }]] },
                    },
                  },
                ],
                { allowDiskUse: true },
              ).toArray((err, points) => {
                if (err) reject(err);
                redisClient.set(`v_cluster_facility_${idFacility}`, JSON.stringify(points), 'EX', 172800);
                resolve(points);
              });
            }).catch((e) => reject({ m: e }));
          }
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  delete(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then(async (facility) => {
            id = new ObjectID(id);
            // we need to validate if  don't have another organization with the same name
            facility.find({ _id: id }).count((err, c) => {
              if (err) reject({ m: err });
              else if (c === 0) reject({ m: 'We cannot delete your IXP' });
              else {
                facility.updateOne(
                  { $and: [adms(user), { _id: id }] }, { $set: { deleted: true, uDate: luxon.DateTime.utc() } }, (err, u) => {
                    if (err) reject(err);
                    else if (u.result.nModified !== 1) resolve({ m: 'We cannot delete your IXP' });
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

  addByTransfer(data) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          console.log(data.fac_id);
          facility.find({ fac_id: String(data.fac_id) }).count(async (err, c) => {
            if (err) resolve({ m: err });
            else if (c > 0) resolve({ m: 'We have registered in our system more than one organization with the same name' });
            else {
              data.polygon.properties.height = (data.polygon.properties.height === '') ? 30 : parseFloat(data.polygon.properties.height);
              data = {
                uuid: '',
                fac_id: String(data.fac_id),
                name: String(data.name),
                notes: '', // String(data.notes)
                point: JSON.parse(data.point),
                address: [
                  {
                    reference: `${data.address1} ${data.address2}`,
                    street: `${data.address1} ${data.address2}`,
                    apt: `#${data.osm_addr_housenumber}`,
                    city: data.city,
                    state: data.state,
                    zipcode: data.zipcode,
                    country: countries(data.country),
                  },
                ],
                websites: data.website,
                // information: String(data.information),
                geom: {
                  type: 'FeatureCollection',
                  features: [(data.polygon.geometry) ? data.polygon : { type: 'Feature', geometry: JSON.parse(data.point) }],
                },
                ixps: [],
                tags: [],
                t: data.osm_telecom,
                startDate: data.osm_start_date,
                building: (data.osm_building === 'yes') ? 'Building' : data.osm_building,
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
                status: true,
                deleted: false,
              };// we need search about the information
              facility.insertOne(data, (err, i) => {
                if (err) resolve({ m: err + 0 });
                resolve();
              });
            }
          });
        }).catch((e) => reject({ m: e + 1 }));
      } catch (e) { reject({ m: e + 2 }); }
    });
  }

  list(user, page) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          const limit = 40;
          this.model().then((facilities) => {
            facilities.aggregate([
              {
                $project: {
                  name: 1,
                  fac_id: 1,
                  website: 1,
                  uuid: 1,
                  deleted: 1,
                  rgDate: 1,
                  uDate: 1,
                },
              },
              {
                $sort: { name: 1 },
              },
              {
                $match: adms(user),
              },
              { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
              { $limit: limit },
            ]).toArray((err, rCables) => {
              if (err) reject(err);
              resolve({ m: 'Loaded', r: rCables });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  view(user, id) {
    return new Promise((resolve, reject) => {
      try {
        redisClient.redisClient.get(`v_facility_${id}`, (err, reply) => {
          if (err) reject({ m: err });
          else if (reply) resolve(((JSON.parse(reply))));
          else {
            this.model().then((facility) => {
              facility.aggregate([
                {
                  $match: {
                    _id: new ObjectID(id),
                  },
                },
                {
                  $project: { geom: 0 },
                },
                {
                  $addFields: {
                    subsea: { $ifNull: ['$subsea', []] },
                    terrestrials: { $ifNull: ['$terrestrials', []] },
                    sProviders: { $ifNull: ['$sProviders', []] },
                    csp: { $ifNull: ['$csp', []] },
                    owners: { $ifNull: ['$owners', []] },
                    ixps: { $ifNull: ['$ixps', []] },
                  },
                },
                {
                  $lookup: {
                    from: 'cables',
                    let: { f: '$subsea' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          terrestrial: 1,
                        },
                      },
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$$f' }, 'array'] },
                              then: '$$f',
                              else: [],
                            },
                          },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$f'],
                              },
                            },
                            {
                              deleted: { $ne: true },
                            },
                            {
                              terrestrial: false,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          terrestrial: 0, f: 0,
                        },
                      },
                      { $sort: { name: 1 } },
                    ],
                    as: 'subsea',
                  },
                }, {
                  $lookup: {
                    from: 'cables',
                    let: { f: '$terrestrials' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          terrestrial: 1,
                        },
                      },
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$$f' }, 'array'] },
                              then: '$$f',
                              else: [],
                            },
                          },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$f'],
                              },
                            },
                            {
                              deleted: { $ne: true },
                            },
                            {
                              terrestrial: true,
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          terrestrial: 0, f: 0,
                        },
                      },
                      { $sort: { name: 1 } },
                    ],
                    as: 'terrestrials',
                  },
                },
                {
                  $lookup: {
                    from: 'organizations',
                    let: { f: '$sProviders' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$$f' }, 'array'] },
                              then: '$$f',
                              else: [],
                            },
                          },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$f'],
                              },
                            },
                            {
                              deleted: { $ne: true },
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          f: 0,
                        },
                      },
                      { $sort: { name: 1 } },
                    ],
                    as: 'sProviders',
                  },
                },
                {
                  $lookup: {
                    from: 'organizations',
                    let: { f: '$csp' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$$f' }, 'array'] },
                              then: '$$f',
                              else: [],
                            },
                          },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$f'],
                              },
                            },
                            {
                              deleted: { $ne: true },
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          f: 0,
                        },
                      },
                      { $sort: { name: 1 } },
                    ],
                    as: 'csp',
                  },
                },
                {
                  $lookup: {
                    from: 'organizations',
                    let: { f: '$owners' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$$f' }, 'array'] },
                              then: '$$f',
                              else: [],
                            },
                          },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$f'],
                              },
                            },
                            {
                              deleted: { $ne: true },
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          f: 0,
                        },
                      },
                      { $sort: { name: 1 } },
                    ],
                    as: 'owners',
                  },
                },
                {
                  $lookup: {
                    from: 'ixps',
                    let: { f: '$ixps' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          geom: 1,
                        },
                      },
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$$f' }, 'array'] },
                              then: '$$f',
                              else: [],
                            },
                          },
                          geom: { $ifNull: ['$geom', {}] },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$f'],
                              },
                            },
                            {
                              geom: { $ne: {} },
                            },
                            {
                              deleted: { $ne: true },
                            },
                          ],
                        },
                      },
                      {
                        $addFields: {
                          elmnt: {
                            type: 'Feature',
                            properties: { name: '$name', id: { $toString: '$_id' }, _id: { $toString: '$_id' } },
                            geometry: '$geom',
                          },
                        },
                      },
                      {
                        $project: { elmnt: 1 },
                      },
                    ],
                    as: 'ixpsElements',
                  },
                },
                {
                  $addFields: {
                    cluster: {
                      type: 'FeatureCollection',
                      features: '$ixpsElements.elmnt',
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'ixps',
                    let: { f: '$ixps' },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                        },
                      },
                      {
                        $addFields: {
                          f: {
                            $cond: {
                              if: { $eq: [{ $type: '$$f' }, 'array'] },
                              then: '$$f',
                              else: [],
                            },
                          },
                        },
                      },
                      {
                        $match: {
                          $and: [
                            {
                              $expr: {
                                $in: ['$_id', '$$f'],
                              },
                            },
                            {
                              deleted: { $ne: true },
                            },
                          ],
                        },
                      },
                      {
                        $project: {
                          f: 0,
                        },
                      },
                      { $sort: { name: 1 } },
                    ],
                    as: 'ixps',
                  },
                },
                {
                  $lookup: {
                    from: 'alerts',
                    let: { elemnt: { $toString: '$_id' } },
                    pipeline: [
                      {
                        $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '4' }, { uuid: user }, { disabled: false }] },
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
                    ixpsElements: 0,
                    point: 0,
                    status: 0,
                    deleted: 0,
                  },
                },
              ]).toArray((err, c) => {
                if (err) reject(err);
                redisClient.set(`v_facility_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
                resolve({ m: 'Loaded', r: c });
              });
            });
          }
        });
      } catch (e) { reject({ m: e }); }
    });
    // return new Promise((resolve, reject) => {
    //   try {
    //     redisClient.redisClient.get(`v_facility_${id}`, (err, reply) => {
    //       if (err) reject({ m: err });
    //       else if (reply) resolve(((JSON.parse(reply))));
    //       else {
    //         this.model().then((facility) => {
    //           facility.aggregate([
    //             {
    //               $match: {
    //                 _id: new ObjectID(id),
    //               },
    //             },
    //             {
    //               $project: { geom: 0 },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'cables',
    //                 let: { facilities: '$_id' },
    //                 pipeline: [
    //                   {
    //                     $addFields: {
    //                       facilities: {
    //                         $cond: {
    //                           if: { $eq: [{ $type: '$facilities' }, 'array'] },
    //                           then: '$facilities',
    //                           else: [],
    //                         },
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $match: {
    //                       $and: [
    //                         {
    //                           $expr: {
    //                             $in: ['$$facilities', '$facilities'],
    //                           },
    //                         },
    //                         {
    //                           deleted: false,
    //                         },
    //                       ],
    //                     },
    //                   },
    //                   {
    //                     $project: {
    //                       _id: 1,
    //                       name: 1,
    //                     },
    //                   },
    //                 ],
    //                 as: 'cables',
    //               },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'networks',
    //                 let: { ixps: '$_id' },
    //                 pipeline: [
    //                   {
    //                     $addFields: {
    //                       ixps: {
    //                         $cond: {
    //                           if: { $eq: [{ $type: '$ixps' }, 'array'] },
    //                           then: '$ixps',
    //                           else: [],
    //                         },
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $match: {
    //                       $expr: {
    //                         $in: ['$$ixps', '$ixps'],
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $project: {
    //                       _id: 1,
    //                       name: 1,
    //                       organizations: 1,
    //                     },
    //                   },
    //                 ],
    //                 as: 'networks',
    //               },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'organizations',
    //                 let: { f: '$owners' },
    //                 pipeline: [
    //                   {
    //                     $addFields: {
    //                       f: {
    //                         $cond: {
    //                           if: { $eq: [{ $type: '$owners' }, 'array'] },
    //                           then: '$owners',
    //                           else: [],
    //                         },
    //                       },
    //                     },
    //                   },
    //                   {
    //                     $match: {
    //                       $and: [
    //                         {
    //                           $expr: {
    //                             $in: ['$_id', '$f'],
    //                           },
    //                         },
    //                         {
    //                           deleted: false,
    //                         },
    //                       ],
    //                     },
    //                   },
    //                   {
    //                     $project: {
    //                       label: '$name',
    //                     },
    //                   },
    //                 ],
    //                 as: 'owners',
    //               },
    //             },
    //             {
    //               $lookup: {
    //                 from: 'alerts',
    //                 let: { elemnt: { $toString: '$_id' } },
    //                 pipeline: [
    //                   {
    //                     $match: { $and: [{ $expr: { elemnt: '$$elemnt' } }, { t: '4' }, { uuid: user }, { disabled: false }] },
    //                   },
    //                 ],
    //                 as: 'alert',
    //               },
    //             },
    //             {
    //               $addFields: { alert: { $size: '$alert' } },
    //             },
    //             {
    //               $project: {
    //                 point: 0,
    //                 status: 0,
    //                 deleted: 0,
    //               },
    //             },
    //           ]).toArray((err, c) => {
    //             if (err) reject(err);
    //             redisClient.set(`v_facility_${id}`, JSON.stringify({ m: 'Loaded', r: c }), 'EX', 172800);
    //             resolve({ m: 'Loaded', r: c });
    //           });
    //         });
    //       }
    //     });
    //   } catch (e) { reject({ m: e }); }
    // });
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
                name: 1,
                geom: 1,
              },
            },
            {
              $unwind: '$geom.features',
            },
            {
              $addFields: {
                'geom.features.properties.name': '$name',
              },
            },
            {
              $group: {
                _id: '$_id',
                geom: {
                  $push: '$geom',
                },
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

  getNameElemnt(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          facility.aggregate([
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

  owner(user, id) {
    return new Promise((resolve, reject) => {
      try {
        if (user !== undefined || user !== '') {
          this.model().then((facility) => {
            id = new ObjectID(id);
            facility.aggregate([
              {
                $match: {
                  _id: id,
                },
              },
              {
                $addFields: {
                  ixps: { $ifNull: ['$ixps', []] },
                  terrestrials: { $ifNull: ['$terrestrials', []] },
                  subsea: { $ifNull: ['$subsea', []] },
                  csp: { $ifNull: ['$csp', []] },
                  sProviders: { $ifNull: ['$sProviders', []] },
                  owners: { $ifNull: ['$owners', []] },
                  fac_id: { $ifNull: ['$fac_id', ''] },
                },
              },
              {
                $addFields: {
                  owners: {
                    $cond: {
                      if: { $eq: [{ $type: '$owners' }, 'array'] },
                      then: '$owners',
                      else: [],
                    },
                  },
                },
              },
              {
                $lookup: {
                  from: 'ixps',
                  let: { f: '$ixps' },
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
                  as: 'ixps',
                },
              },
              {
                $lookup: {
                  from: 'cables',
                  let: { f: '$terrestrials' },
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
                  as: 'terrestrials',
                },
              },
              {
                $lookup: {
                  from: 'cables',
                  let: { f: '$subsea' },
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
                  as: 'subsea',
                },
              },
              {
                $lookup: {
                  from: 'cloud',
                  let: { f: '$csp' },
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
                  as: 'csp',
                },
              },
              {
                $lookup: {
                  from: 'organizations',
                  let: { f: '$sProviders' },
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
                  as: 'sProviders',
                },
              },
              {
                $lookup: {
                  from: 'organizations',
                  let: { f: '$owners' },
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
                        label: '$name',
                      },
                    },
                  ],
                  as: 'owners',
                },
              },
              {
                $unwind: '$geom.features',
              },
              {
                $addFields: {
                  'geom.features.properties.name': '$name',
                  'geom.features.properties._id': '$_id',
                },
              },
              {
                $group: {
                  _id: '$_id',
                  name: { $first: '$name' },
                  notes: { $first: '$notes' },
                  point: { $first: '$point' },
                  address: { $first: '$address' },
                  website: { $first: '$website' },
                  ixps: { $first: '$ixps' },
                  terrestrials: { $first: '$terrestrials' },
                  subsea: { $first: '$subsea' },
                  csp: { $first: '$csp' },
                  sProviders: { $first: '$sProviders' },
                  tags: { $first: '$tags' },
                  t: { $first: '$t' },
                  StartDate: { $first: '$StartDate' },
                  building: { $first: '$building' },
                  rgDate: { $first: '$rgDate' },
                  uDate: { $first: '$uDate' },
                  status: { $first: '$status' },
                  deleted: { $first: '$deleted' },
                  owners: { $first: '$owners' },
                  features: { $push: '$geom.features' },
                  // New Fields
                  buildingSize: { $first: '$buildingSize' },
                  grossColocationSize: { $first: '$grossColocationSize' },
                  floorLoadingCapacity: { $first: '$floorLoadingCapacity' },
                  isCarrierNeutral: { $first: '$isCarrierNeutral' },
                  isLoadingDocks: { $first: '$isLoadingDocks' },
                  enType: { $first: '$enType' },
                  authentication: { $first: '$authentication' },
                  rackHeight: { $first: '$rackHeight' },
                  meetMeRooms: { $first: '$meetMeRooms' },
                  platform: { $first: '$platform' },
                  totalPower: { $first: '$totalPower' },
                  pue: { $first: '$pue' },
                  utilityConnectionRedundancy: { $first: '$utilityConnectionRedundancy' },
                  maxRackPower: { $first: '$maxRackPower' },
                  backupPowerDuration: { $first: '$backupPowerDuration' },
                  backupPowerRedundancy: { $first: '$backupPowerRedundancy' },
                  coolingCapacity: { $first: '$coolingCapacity' },
                  temperature: { $first: '$temperature' },
                  humidity: { $first: '$humidity' },
                  bulletProffGlass: { $first: '$bulletProffGlass' },
                  cctv: { $first: '$cctv' },
                  securityGuards: { $first: '$securityGuards' },
                  mantrap: { $first: '$mantrap' },
                  biometric: { $first: '$biometric' },
                  meetingRooms: { $first: '$meetingRooms' },
                  breakRooms: { $first: '$breakRooms' },
                  carParking: { $first: '$carParking' },
                  spareParts: { $first: '$spareParts' },
                  stagingRooms: { $first: '$stagingRooms' },
                  officeSpace: { $first: '$officeSpace' },
                  internetAccess: { $first: '$internetAccess' },
                  fac_id: { $first: '$fac_id' },
                },
              },
              {
                $addFields: {
                  geom: {
                    type: 'FeatureCollection',
                    features: '$features',
                  },
                },
              },
              {
                $project: {
                  features: 0,
                },
              },
            ]).toArray((err, o) => {
              if (err) reject(err);
              if (typeof o !== 'undefined') { resolve({ m: 'Loaded', r: o[0] }); } else resolve({ m: 'Loaded', r: {} });
            });
          });
        } else { resolve('Not user found'); }
      } catch (e) { reject({ m: e }); }
    });
  }

  getBoundsCoords(coords) {
    return new Promise((resolve, reject) => {
      try {
        const reduceCoords = [];
        for (let i = 0; i < coords.length; ++i) {
          for (let j = 0; j < coords[i].length; ++j) { reduceCoords.push(coords[i][j]); }
        }
        resolve(reduceCoords);
      } catch (e) { reject(e); }
    });
  }

  bbox(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          facility.aggregate([
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
            if (err) { reject(err); } else if (c[0] !== undefined) {
              if (c[0].coordinates !== undefined) {
                resolve({ m: 'Loaded', r: c[0].coordinates });
              }
            }
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  search(user, search) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((facility) => {
          const uuid = (search.psz === '1') ? adms(user) : {};
          let sortBy = {};
          const limit = 40;
          const page = (search.page) ? search.page : 0;
          if (search.sortBy !== undefined || search.sortBy !== '') {
            // eslint-disable-next-line no-unused-vars
            switch (search.sortBy) {
              case 'nameAsc':
                sortBy = { slug: 1 };
                break;
              case 'nameDesc':
                sortBy = { slug: -1 };
                break;
              case 'creatAtAsc':
                sortBy = { rgDate: 1 };
                break;
              case 'creatAtDesc':
                sortBy = { rgDate: -1 };
                break;
              case 'updateAtAsc':
                sortBy = { uDate: 1 };
                break;
              case 'updateAtDesc':
                sortBy = { uDate: -1 };
                break;
              default:
                sortBy = { slug: 1 };
                break;
            }
          } else { sortBy = { slug: 1 }; }

          facility.aggregate([
            {
              $project: {
                _id: 1,
                uuid: 1,
                name: 1,
                slug: 1,
                alerts: 1,
                deleted: 1,
                rgDate: 1,
                uDate: 1,
              },
            },
            // {
            //   $match: { $and: [uuid, { name: { $regex: search.s.toLowerCase(), $options: 'i' } }, (String(search.psz) !== '1') ? { deleted: { $ne: true } } : {}] },
            // },
            {
              $match: {
                $and: [
                  uuid,
                  { name: { $regex: search.s, $options: 'i' } },
                  (String(search.psz) !== '1') ? { deleted: { $ne: true } } : {},
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
              $sort: sortBy,
            },
            { $skip: ((parseInt(limit) * parseInt(page)) - parseInt(limit) > 0) ? (parseInt(limit) * parseInt(page)) - parseInt(limit) : 0 },
            { $limit: limit },
          ]).toArray((err, r) => {
            resolve(r);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  // getElementGeom(id) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.model().then((facility) => {
  //         facility.aggregate([
  //           {
  //             $match: {
  //               _id: new ObjectID(id),
  //             },
  //           },
  //           {
  //             $project: {
  //               geom: 1,
  //             },
  //           },
  //         ]).toArray((err, r) => {
  //           if (err) reject(err);
  //           resolve({ m: 'Loaded', r: r[0].geom });
  //         });
  //       });
  //     } catch (e) { reject({ m: e }); }
  //   });
  // }

  getMultiElementsGeom(ids) {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(ids) || ids.length === 0) resolve({ m: 'Loaded', r: false });
        ids = ids.map((i) => new ObjectID(i));
        this.model().then((facility) => {
          facility.aggregate([
            {
              $match: {
                $expr: {
                  $in: ['$_id', ids],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                geom: 1,
              },
            },
            {
              $unwind: '$geom.features',
            },
            {
              $addFields: {
                'geom.features.properties.name': '$name',
              },
            },
            {
              $group: {
                _id: '$_id',
                geom: {
                  $push: '$geom.features',
                },
              },
            },
            // {
            //   $project: {
            //     type: 'FeatureCollection',
            //     features: '$geom.features',
            //   },
            // },
          ]).toArray(async (err, polygon) => {
            if (err) return 'Error';
            // // we'll going to create the master file for ixps
            polygon = await polygon.reduce((total, value) => total.concat(value.geom), []);
            polygon = {
              type: 'FeatureCollection',
              features: polygon,
            };
            resolve({ m: 'Loaded', r: polygon });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  getMultiElementsGeomPoints(ids) {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(ids) || ids.length === 0) resolve({ m: 'Loaded', r: false });
        ids = ids.map((i) => new ObjectID(i));
        this.model().then((facility) => {
          facility.aggregate([
            {
              $match: {
                $expr: {
                  $in: ['$_id', ids],
                },
              },
            },
            {
              $project: {
                geom: {
                  type: 'Feature',
                  geometry: '$point',
                  properties: {
                    _id: '$_id',
                    name: '$name',
                  },
                },
              },
            },
            // {
            //   $project: {
            //     _id: 1,
            //     name: 1,
            //     geom: {
            //       type: 'Feature',
            //       geometry: '$point',
            //       properties: {
            //         _id: '$_id',
            //         name: '$name',
            //       },
            //     },
            //   },
            // },
            // {
            //   $unwind: '$geom.features',
            // },
            // {
            //   $addFields: {
            //     'geom.features.properties.name': '$name',
            //   },
            // },
            // {
            //   $group: {
            //     _id: '$_id',
            //     features: {
            //       $push: '$geom.features',
            //     },
            //   },
            // },
            // {
            //   $project: {
            //     type: 'FeatureCollection',
            //     features: '$geom.features',
            //   },
            // },
          ]).toArray(async (err, points) => {
            if (err) return 'Error';
            // // we'll going to create the master file for ixps
            points = await points.reduce((total, value) => total.concat(value.geom), []);
            points = {
              type: 'FeatureCollection',
              features: points,
            };
            resolve({ m: 'Loaded', r: points });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  createBBOXs() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((bboxQuery) => {
          bboxQuery.aggregate([{
            $project: {
              _id: 1,
            },
          }], { allowDiskUse: true }).toArray(async (err, results) => {
            if (err) reject(err);
            else if (results.length !== []) {
              await results.map((element) => {
                this.bbox(element._id).then((bbox) => redisClient.set(`facility_${element._id}`, JSON.stringify(bbox)));
              });
            }
            resolve({ m: 'loaded' });
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  createDATA() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((bboxQuery) => {
          bboxQuery.aggregate([{
            $project: {
              _id: 1,
            },
          }], { allowDiskUse: true }).toArray(async (err, results) => {
            if (err) reject(err);
            else if (results.length !== []) {
              await results.map((element) => {
                this.view('', element._id);
                this.clusterIxpConnection(element._id);
              });
            }
            resolve({ m: 'loaded' });
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  checkName(name) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((search) => {
          search.find({ name }).count((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
          });
        });
      } catch (e) {
        reject({ m: e });
      }
    });
  }

  checkPeeringDb(fac_id) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((search) => {
          search.find({ fac_id }).count((err, c) => {
            if (err) reject({ m: err });
            resolve({ m: 'Loaded', r: c });
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
        if (Object.keys(adms(usr)).length === 0) {
          if (true) { // code === process.env.securityCode
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

  getIdBySlug(slug) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((elemnt) => {
          elemnt.findOne({ slug }, (err, r) => {
            if (err) reject({ m: err });
            resolve({ m: '', r: (r._id) ? r._id : '' });
          });
        }).catch((e) => reject({ m: e }));
      } catch (e) { reject({ m: e }); }
    });
  }

  getNamesByList(ids) {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(ids) || ids.length === 0) resolve({ m: 'Loaded', r: false });
        ids = ids.map((i) => new ObjectID(i));
        this.model().then((facility) => {
          facility.aggregate([
            {
              $match: {
                $expr: {
                  $in: ['$_id', ids],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ]).toArray(async (err, names) => {
            if (err) return 'Error';
            resolve({ m: 'Loaded', r: names });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  centroid() {
    return new Promise((resolve, reject) => {
      try {
        const turf = require('@turf/turf');
        this.model().then((facilities) => {
          facilities.aggregate([
            {
              $match: {
                deleted: { $ne: true },
              },
            },
            {
              $project: {
                geom: 1,
              },
            },
            {
              $unwind: {
                path: '$geom.features',
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $group: {
                _id: '$_id',
                geom: { $first: '$geom' },
              },
            },
          ]).toArray(async (err, r) => {
            if (err) { reject({ m: 'Error' }); }
            await r.map((item) => {
              if (Array.isArray(item.geom.features.geometry.coordinates)) {
                const centroid = turf.centroid(item.geom.features);
                facilities.updateOne({
                  _id: new ObjectID(item._id),
                }, { $set: { point: centroid.geometry } }, (err, u) => {});
              }
            });
            resolve({ m: 'Loaded' });
          });
        }).catch((e) => {
          reject({ m: 'Error' });
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  checkElements(res) {
    return new Promise((resolve, reject) => {
      try {
        const urlencode = require('urlencode');
        this.model().then((facilities) => {
          facilities.aggregate([
            {
              $match: {
                deleted: { $ne: true },
              },
            },
            {
              $project: {
                name: 1,
                slug: 1,
                point: 1,
                address: 1,
                fac_id: 1,
              },
            },
          ], { allowDiskUse: true }).toArray((err, fs) => {
            const ejs = require('ejs');
            ejs.renderFile('templates/infrapedia/checkElementsFacilities.ejs', {
              facilities: fs,
              urlencode,
              key: process.env.MAPBOX,
            }, (err, html) => {
              if (err) { res.sendStatus(400); }
              res.send(html);
            });
          });
        }).catch((e) => {
          res.sendStatus(400);
        });
      } catch (e) { reject({ m: e }); }
    });
  }
}

module.exports = Facility;
