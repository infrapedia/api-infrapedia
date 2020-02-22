const cp = require('child_process');
const fs = require('fs');

module.exports = {
  // cables: () => {
  //   try {
  //     const cable = require('../models/cable.model');
  //     cable().then((cable) => {
  //
  //     }).catch((e) => 'Error');
  //   } catch (e) { return 'Error'; }
  // },
  cls: () => {
    try {
      const cls = require('../models/cls.model');
      cls().then((cls) => {
        cls.aggregate([
          {
            $unwind:
               {
                 path: '$geom.features',
                 preserveNullAndEmptyArrays: false
               },
          },
          {
            $addFields: {
              feature: {
                type: 'Feature',
                geometry: '$geom.features.geometry',
                properties: {
                  id: { $toString: '$_id' },
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
            await fs.writeFile('./temp/cls.json', multipoints, (err) => {
              if (err) throw err;
              console.log('The file was created');
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
                  id: { $toString: '$_id' },
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
            await fs.writeFile('./temp/ixps.json', multipoints, (err) => {
              if (err) throw err;
              console.log('The file was created');
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
                id: { $toString: '$_id' },
                name: '$name',
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
        ], { allowDiskUse: false }).toArray(async (err, multipoints) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          multipoints = await multipoints.reduce((total, value) => total.concat(value.feature), []);
          multipoints = `{
                              "type": "FeatureCollection",
                              "features": ${JSON.stringify(multipoints)}
                          }`;
          try {
            await fs.writeFile('./temp/facilities.json', multipoints, (err) => {
              if (err) throw err;
              console.log('The file was created');
            });
          } catch (err) { return err; }
        });
      }).catch((e) => 'Error');
    } catch (e) { return 'Error'; }
  },
};
