const cp = require('child_process');
const fs = require('fs');
const notifications = require('./helpers/sendNotificationEmailUsingMandrill');

module.exports = {
  cablesT: () => {
    try {
      const cable = require('../models/cable.model');
      cable().then((cable) => {
        cable.aggregate([
          {
            $match: {
              terrestrial: true,
            },
          },
          {
            $unwind:
               {
                 path: '$geom.features',
                 preserveNullAndEmptyArrays: false,
               },
          },
          {
            $addFields: {
              'geom.features.properties.name': '$name',
              'geom.features.properties.segment': '$geom.features.properties._id',
              'geom.features.properties._id': '$_id',
              'geom.features.properties.systemLength': '$systemLenght',
              'geom.features.properties.capacityTBPS': '$capacityTBPS',
              'geom.features.properties.terrestrial': '$terrestrial',
              'geom.features.properties.category': '$category',
              'geom.features.properties.activation': { $subtract: ['$activationDateTime', new Date('1970-01-01')] },
              // 'geom.features.properties.facilities': '$facilities',
            },
          },
          {
            $project: {
              'geom.features.id': 0,
            },
          },
          {
            $project: {
              geom: 1,
            },
          },
          {
            $addFields: {
              geom: '$geom.features',
            },
          },
        ], { allowDiskUse: false }).toArray(async (err, lines) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          lines = await lines.reduce((total, value) => total.concat(value.geom), []);
          lines = `{
                              "type": "FeatureCollection",
                              "features": ${JSON.stringify(lines)}
                          }`;
          try {
            const stream = await fs.createWriteStream('./temp/cables_terrestrial.json');
            stream.write(lines);
            stream.on('err', () => {
              console.log('Error to create the file');
            });
            stream.end(async () => {
              const stream = await fs.createWriteStream('./temp/cables_terrestrial.txt');
              stream.write('');
              stream.on('err', () => notifications('Master file of terrestrial cables wasn\'t created', new Date()));
              stream.end(() => notifications('Master file of terrestrial cables was created', new Date()));
            });
          } catch (err) { return err; }
        });
      }).catch((e) => e);
    } catch (e) { return e; }
  },
  cablesS: () => {
    try {
      const cable = require('../models/cable.model');
      cable().then((cable) => {
        cable.aggregate([
          {
            $match: {
              terrestrial: false,
            },
          },
          {
            $unwind:
               {
                 path: '$geom.features',
                 preserveNullAndEmptyArrays: false,
               },
          },
          {
            $addFields: {
              'geom.features.properties.name': '$name',
              'geom.features.properties.segment': '$geom.features.properties._id',
              'geom.features.properties._id': '$_id',
              'geom.features.properties.systemLength': '$systemLenght',
              'geom.features.properties.capacityTBPS': '$capacityTBPS',
              'geom.features.properties.terrestrial': '$terrestrial',
              'geom.features.properties.category': '$category',
              'geom.features.properties.activationDateTime': { $subtract: ['$activationDateTime', new Date('1970-01-01')] },
              // 'geom.features.properties.facilities': '$facilities',
            },
          },
          {
            $project: {
              'geom.features.id': 0,
            },
          },
          {
            $project: {
              geom: 1,
            },
          },
          {
            $addFields: {
              geom: '$geom.features',
            },
          },
        ], { allowDiskUse: false }).toArray(async (err, lines) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          lines = await lines.reduce((total, value) => total.concat(value.geom), []);
          lines = `{
                              "type": "FeatureCollection",
                              "features": ${JSON.stringify(lines)}
                          }`;
          try {
            const stream = await fs.createWriteStream('./temp/cables_subsea.json');
            stream.write(lines);
            stream.on('err', () => {
              console.log('Error to create the file');
            });
            stream.end(async () => {
              const stream = await fs.createWriteStream('./temp/cables_subsea.txt');
              stream.write('');
              stream.on('err', () => notifications('Master file of subsea cables wasn\'t created', new Date()));
              stream.end(() => notifications('Master file of subsea cables was created', new Date()));
            });
          } catch (err) { return err; }
        });
      }).catch((e) => e);
    } catch (e) { return e; }
  },
  cls: () => {
    try {
      const cls = require('../models/cls.model');
      cls().then((cls) => {
        cls.aggregate([
          {
            $unwind:
               {
                 path: '$geom.features',
                 preserveNullAndEmptyArrays: false,
               },
          },
          {
            $addFields: {
              feature: {
                type: 'Feature',
                geometry: '$geom.features.geometry',
                properties: {
                  _id: { $toString: '$_id' },
                  name: '$name',
                  type: 'cls',
                },
              },
            },
          },
          {
            $project: {
              feature: 1,
            },
          },
        ], { allowDiskUse: false }).toArray(async (err, multipoints) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          multipoints = await multipoints.reduce((total, value) => total.concat(value.feature), []);
          multipoints = `{
                              "type": "FeatureCollection",
                              "features": ${JSON.stringify(multipoints)}
                          }`;
          try {
            const stream = await fs.createWriteStream('./temp/cls.json');
            stream.write(multipoints);
            stream.on('err', () => {
              console.log('Error to create the file');
            });
            stream.end(async () => {
              const stream = await fs.createWriteStream('./temp/cls.txt');
              stream.write('');
              stream.on('err', () => notifications('Master file of cls wasn\'t created', new Date()));
              stream.end(() => notifications('Master file of cls was created', new Date()));
            });
          } catch (err) { return err; }
        });
      }).catch((e) => e);
    } catch (e) { return e; }
  },
  ixps: () => {
    try {
      const ixps = require('../models/ixp.model');
      ixps().then((ixps) => {
        ixps.aggregate([
          {
            $addFields: {
              feature: {
                type: 'Feature',
                geometry: '$geom',
                properties: {
                  _id: { $toString: '$_id' },
                  name: '$name',
                  type: 'ixps',
                },
              },
            },
          },

          {
            $project: {
              feature: 1,
            },
          },
        ], { allowDiskUse: false }).toArray(async (err, multipoints) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          multipoints = await multipoints.reduce((total, value) => total.concat(value.feature), []);
          multipoints = `{
                              "type": "FeatureCollection",
                              "features": ${JSON.stringify(multipoints)}
                          }`;
          try {
            const stream = await fs.createWriteStream('./temp/ixps.json');
            stream.write(multipoints);
            stream.on('err', () => {
              console.log('Error to create the file');
            });
            stream.end(async () => {
              const stream = await fs.createWriteStream('./temp/ixps.txt');
              stream.write('');
              stream.on('err', () => notifications('Master file of ixps cables wasn\'t created', new Date()));
              stream.end(() => notifications('Master file of ixps cables was created', new Date()));
            });
          } catch (err) { return err; }
        });
      }).catch((e) => e);
    } catch (e) { return e; }
  },
  facilities: () => {
    try {
      const facility = require('../models/facility.model');
      facility().then((facility) => {
        facility.aggregate([
          {
            $lookup: {
              from: 'networks',
              let: { facility: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$$facility', '$facilities'],
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
              let: { orgs: '$networks.organizations' },
              pipeline: [
                {
                  $addFields: {
                    idsorgs: { $cond: { if: { $gte: [{ $size: '$$orgs' }, 1] }, then: '$$orgs', else: [] } },
                  },
                },
                {
                  $addFields: {
                    idsorgs: { $cond: { if: { $gt: [{ $size: '$idsorgs' }, 0] }, then: { $arrayElemAt: ['$idsorgs', 0] }, else: [] } },
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
                    premium: 1,
                  },
                },
              ],
              as: 'organizations',
            },
          },
          {
            $addFields: {
              feature: {
                type: 'Feature',
                geometry: { $arrayElemAt: ['$geom.features.geometry', 0] },
              },
              height: { $arrayElemAt: ['$geom.features.properties.height', 0] },
            },
          },
          {
            $addFields: {
              premium: { $cond: { if: { $gt: [{ $size: '$organizations' }, 0] }, then: { $cond: { if: { $in: [true, '$organizations.premium'] }, then: true, else: false } }, else: false } },
            },
          },
          {
            $addFields: {
              'feature.properties': {
                _id: { $toString: '$_id' },
                name: '$name',
                address: { $arrayElemAt: ['$address.street', 0] },
                type: 'facility',
                height: '$height',
                premium: '$premium',
              },

            },
          },
          {
            $project: {
              'feature.geometry.properties': 0,
            },
          },
          {
            $project: {

              feature: 1,
            },
          },
        ], { allowDiskUse: false }).toArray(async (err, polygon) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          polygon = await polygon.reduce((total, value) => total.concat(value.feature), []);
          polygon = `{
                              "type": "FeatureCollection",
                              "features": ${JSON.stringify(polygon)}
                          }`;
          try {
            const stream = await fs.createWriteStream('./temp/facilities.json');
            stream.write(polygon);
            stream.on('err', () => {
              console.log('Error to create the file');
            });
            stream.end(async () => {
              const stream = await fs.createWriteStream('./temp/facilities.txt');
              stream.write('');
              stream.on('err', () => notifications('Master file of facilities cables wasn\'t created', new Date()));
              stream.end(() => notifications('Master file of facilities cables was created', new Date()));
            });
          } catch (err) { return err; }
        });
      }).catch((e) => 'Error');
    } catch (e) { return 'Error'; }
  },
};
