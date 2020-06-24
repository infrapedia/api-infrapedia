const path = require('path');
const fs = require('fs');
const { ObjectID } = require('mongodb');

const notifications = function (a) { return a; };

module.exports = {
  buildMasterFile: (layer) => new Promise((resolve, reject) => {
    try {
      const directoryPath = path.join(__dirname, `../temp/${layer}/`);
      // passsing directoryPath and callback function
      fs.readdir(directoryPath, (err, files) => {
        console.log(files);
        // handling error
        if (err) {
          reject('Unable to scan directory: ');
        }
        fs.createWriteStream(path.join(__dirname, `../temp/${layer}.json`)).end();
        fs.appendFileSync(path.join(__dirname, `../temp/${layer}.json`), '{\n'
          + '                              "type": "FeatureCollection",\n'
          + '                              "features":[', 'utf8');
        // listing all files using forEach
        let filesReaded = 0;
        files.forEach((file) => {
          console.log(file);
          // Do whatever you want to do with the file
          let data = '';
          const stream = fs.createReadStream(path.join(__dirname, `../temp/${layer}/${file}`));
          stream.on('data', (chunk) => data += chunk);
          stream.on('end', () => {
            filesReaded += 1;
            console.log(filesReaded);
            data = JSON.parse(data);
            if (data.features[0] !== undefined) {
              // masterFile.write = JSON.stringify(data.features[0]);
              fs.appendFileSync(path.join(__dirname, `../temp/${layer}.json`), (filesReaded < files.length)
                ? `\n${data.features.map((f) => `${JSON.stringify(f)}`)},` : `\n${data.features.map((f) => `${JSON.stringify(f)}`)}`, 'utf8');
              if (filesReaded === files.length) {
                fs.appendFileSync(path.join(__dirname, `../temp/${layer}.json`), ']}', 'utf8');
                const stream = fs.createWriteStream('./temp/cables.txt');
                stream.write('');
                stream.on('err', () => notifications('Master file of cables wasn\'t created', new Date()));
                stream.end(() => notifications('Master file of cables cables was created', new Date()));
                resolve();
              }
              // fs.unlink(path.join(__dirname, `../temp/${layer}/${file}`), () => {
              //   if (filesReaded === files.length) {
              //     fs.appendFileSync(path.join(__dirname, `../temp/${layer}.json`), ']}', 'utf8');
              //     // masterFile.write = ']}';
              //     // masterFile.end();
              //     resolve();
              //   }
              // });
            }
          });
        });
      });
    } catch (e) {
      reject(e);
    }
  }),
  cables: () => {
    try {
      const cable = require('../models/cable.model');
      let secuencial = 0;
      cable().then((cable) => {
        cable.aggregate([
          // {
          //   $match: { $and: [{ terrestrial: true }] },
          // },
          {
            $match: { $and: [{ deleted: false }] },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ]).toArray(async (err, ids) => {
          let checkedFiles = 0;
          console.log(`=================${ids.length}=================`);
          const stream = fs.createWriteStream('./temp/check.txt');
          stream.write(`${ids.length}`);
          stream.on('err', () => { console.log('Error to create the file'); });
          stream.end(async () => {});

          await ids.map((id) => {
            secuencial += 1;
            cable.aggregate([
              {
                $match: {
                  _id: new ObjectID(id._id),
                },
              },
              {
                $lookup: {
                  from: 'cables_segments',
                  localField: '_id',
                  foreignField: 'cable_id',
                  as: 'geom',
                },
              },
              {
                $unwind:
                  {
                    path: '$geom',
                    preserveNullAndEmptyArrays: false,
                  },
              },
              {
                $addFields: {
                  id: { $toInt: secuencial },
                  'properties.id': { $toInt: secuencial },
                },
              },
              {
                $project: {
                  type: 'Feature',
                  id: 1,
                  'properties.id': 1,
                  'properties.length': '$systemLength',
                  'properties.name': '$name',
                  'properties.status': { $cond: { if: { $or: [{ $eq: ['$category', 'active'] }, { $eq: ['$category', ''] }, { $eq: ['$category', 'unknown'] }] }, then: 1, else: 0 } },
                  'properties.category': '$category', // { $cond: { if: { $or: [{ $eq: ['$category', 'active'] }, { $eq: ['$category', ''] }] }, then: 'active', else: '$category' } },
                  'properties.activationDateTime': { $subtract: ['$activationDateTime', new Date('1970-01-01')] },
                  'properties.hasoutage': { $cond: { if: { $eq: ['$category', 'fault'] }, then: 'true', else: 'false' } },
                  'properties.haspartial': { $cond: { if: { $eq: ['$geom.properties.status', 'Inactive'] }, then: 'true', else: 'false' } },
                  'properties.terrestrial': { $toString: '$terrestrial' },
                  'properties.segment': '$geom.properties._id',
                  'properties._id': '$_id',
                  geometry: '$geom.geometry',

                },
              },
            ], { allowDiskUse: true }).toArray(async (err, lines) => {
              if (err) return 'Error';
              // we'll going to create the master file for ixps
              // lines = await lines.reduce((total, value) => total.concat(value.geom), []);
              lines = `{
                                  "id": "${id._id}",
                                  "type": "FeatureCollection",
                                  "features": ${JSON.stringify(lines)}
                              }`;

              if (!fs.existsSync(path.join(__dirname, '../temp/cables'))) fs.mkdirSync(path.join(__dirname, '../temp/cables'));
              try {
                const stream = await fs.createWriteStream(`./temp/cables/${id._id}.json`);
                stream.write(lines);
                stream.on('err', () => {
                  console.log('Error to create the file');
                });
                stream.end(async () => {
                  checkedFiles += 1;
                  console.log(checkedFiles);
                  if (checkedFiles === ids.length) {
                    // module.exports.buildMasterFile('cables').then((mf) => {
                    //   console.log('Finish');
                    // }).catch((e) => console.log(e));
                  }
                });
              } catch (err) { return err; }
            });
          });
        });
      }).catch((e) => e);
    } catch (e) { return e; }
  },
  // cablesT: () => {
  //   try {
  //     const cable = require('../models/cable.model');
  //     cable().then((cable) => {
  //       cable.aggregate([
  //         {
  //           $match: { $and: [{ terrestrial: true }] },
  //         },
  //         {
  //           $project: {
  //             _id: 1,
  //           },
  //         },
  //       ]).toArray(async (err, ids) => {
  //         let checkedFiles = 0;
  //         await ids.map((id) => {
  //           cable.aggregate([
  //             {
  //               $match: {
  //                 _id: new ObjectID(id._id),
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: 'cables_segments',
  //                 localField: '_id',
  //                 foreignField: 'cable_id',
  //                 as: 'geom',
  //               },
  //             },
  //             {
  //               $unwind:
  //                 {
  //                   path: '$geom',
  //                   preserveNullAndEmptyArrays: false,
  //                 },
  //             },
  //             {
  //               $project: {
  //                 type: 'Feature',
  //                 'properties.name': '$name',
  //                 'properties.status': { $cond: { if: { $or: [{ $eq: ['$category', 'active'] }, { $eq: ['$category', ''] }] }, then: 1, else: 0 } },
  //                 'properties.category': { $cond: { if: { $or: [{ $eq: ['$category', 'active'] }, { $eq: ['$category', ''] }] }, then: 'active', else: '$category' } },
  //                 'properties.activationDateTime': { $subtract: ['$activationDateTime', new Date('1970-01-01')] },
  //                 'properties.hasoutage': { $cond: { if: { $eq: ['$category', 'fault'] }, then: 'true', else: 'false' } },
  //                 'properties.haspartial': { $cond: { if: { $eq: ['$geom.properties.status', 'Inactive'] }, then: 'true', else: 'false' } },
  //                 'properties.terrestrial': { $toString: '$terrestrial' },
  //                 'properties.segment': '$geom.properties._id',
  //                 'properties._id': '$_id',
  //                 geometry: '$geom.geometry',
  //
  //               },
  //             },
  //           ], { allowDiskUse: true }).toArray(async (err, lines) => {
  //             if (err) return 'Error';
  //             // we'll going to create the master file for ixps
  //             // lines = await lines.reduce((total, value) => total.concat(value.geom), []);
  //             console.log(lines);
  //             lines = `{
  //                                 "type": "FeatureCollection2",
  //                                 "features": ${JSON.stringify(lines)}
  //                             }`;
  //
  //             if (!fs.existsSync(path.join(__dirname, '../temp/terrestrial'))) fs.mkdirSync(path.join(__dirname, '../temp/terrestrial'));
  //             try {
  //               const stream = await fs.createWriteStream(`./temp/terrestrial/${id._id}.json`);
  //               stream.write(lines);
  //               stream.on('err', () => {
  //                 console.log('Error to create the file');
  //               });
  //               stream.end(async () => {
  //                 checkedFiles += 1;
  //                 console.log(checkedFiles);
  //                 if (checkedFiles === ids.length) {
  //                   module.exports.buildMasterFile('terrestrial').then((mf) => {
  //                     console.log('Finish');
  //                   }).catch((e) => console.log(e));
  //                 }
  //               });
  //             } catch (err) { return err; }
  //           });
  //         });
  //       });
  //     }).catch((e) => e);
  //   } catch (e) { return e; }
  // },
  // cablesS: () => {
  //   try {
  //     const cable = require('../models/cable.model');
  //     cable().then((cable) => {
  //       cable.aggregate([
  //         {
  //           $match: { $and: [{ terrestrial: false }] },
  //         },
  //         {
  //           $project: {
  //             _id: 1,
  //           },
  //         },
  //       ]).toArray(async (err, ids) => {
  //         let checkedFiles = 0;
  //         await ids.map((id) => {
  //           cable.aggregate([
  //             {
  //               $match: {
  //                 _id: new ObjectID(id._id),
  //               },
  //             },
  //             {
  //               $lookup: {
  //                 from: 'cables_segments',
  //                 localField: '_id',
  //                 foreignField: 'cable_id',
  //                 as: 'geom',
  //               },
  //             },
  //             {
  //               $unwind:
  //                 {
  //                   path: '$geom',
  //                   preserveNullAndEmptyArrays: false,
  //                 },
  //             },
  //             {
  //               $project: {
  //                 type: 'Feature',
  //                 'properties.name': '$name',
  //                 'properties.status': { $cond: { if: { $or: [{ $eq: ['$category', 'active'] }, { $eq: ['$category', ''] }] }, then: 1, else: 0 } },
  //                 'properties.category': { $cond: { if: { $or: [{ $eq: ['$category', 'active'] }, { $eq: ['$category', ''] }] }, then: 'active', else: '$category' } },
  //                 'properties.activationDateTime': { $subtract: ['$activationDateTime', new Date('1970-01-01')] },
  //                 'properties.hasoutage': { $cond: { if: { $eq: ['$category', 'fault'] }, then: 'true', else: 'false' } },
  //                 'properties.haspartial': { $cond: { if: { $eq: ['$geom.properties.status', 'Inactive'] }, then: 'true', else: 'false' } },
  //                 'properties.terrestrial': { $toString: '$terrestrial' },
  //                 'properties.segment': '$geom.properties._id',
  //                 'properties._id': '$_id',
  //                 geometry: '$geom.geometry',
  //
  //               },
  //             },
  //           ], { allowDiskUse: true }).toArray(async (err, lines) => {
  //             if (err) return 'Error';
  //             // we'll going to create the master file for ixps
  //             // lines = await lines.reduce((total, value) => total.concat(value.geom), []);
  //             lines = `{
  //                                 "type": "FeatureCollection",
  //                                 "features": ${JSON.stringify(lines)}
  //                             }`;
  //             if (!fs.existsSync(path.join(__dirname, '../temp/subsea'))) fs.mkdirSync(path.join(__dirname, '../temp/subsea'));
  //             try {
  //               const stream = await fs.createWriteStream(`./temp/subsea/${id._id}.json`);
  //               stream.write(lines);
  //               stream.on('err', () => {
  //                 console.log('Error to create the file');
  //               });
  //               stream.end(async () => {
  //                 checkedFiles += 1;
  //                 console.log(checkedFiles);
  //                 if (checkedFiles === ids.length) {
  //                   module.exports.buildMasterFile('subsea').then((mf) => {
  //                     console.log('Finish');
  //                   }).catch((e) => console.log(e));
  //                 }
  //               });
  //             } catch (err) { return err; }
  //           });
  //         });
  //       });
  //     }).catch((e) => e);
  //   } catch (e) { return e; }
  // },
  // // cablesS: () => {
  // //   try {
  // //     const cable = require('../models/cable.model');
  // //     cable().then((cable) => {
  // //       cable.aggregate([
  // //         {
  // //           $match: {
  // //             terrestrial: false,
  // //           },
  // //         },
  // //         {
  // //           $unwind:
  // //             {
  // //               path: '$geom.features',
  // //               preserveNullAndEmptyArrays: false,
  // //             },
  // //         },
  // //         {
  // //           $project: {
  // //             type: 'Feature',
  // //             'properties.name': '$name',
  // //             'properties.status': { $cond: { if: { $or: [{ $eq: ['$category', 'active'] }, { $eq: ['$category', ''] }] }, then: 1, else: 0 } },
  // //             'properties.activationDateTime': { $subtract: ['$activationDateTime', new Date('1970-01-01')] },
  // //             'properties.hasoutage': { $cond: { if: { $eq: ['$category', 'fault'] }, then: 'true', else: 'false' } },
  // //             'properties.haspartial': { $cond: { if: { $eq: ['$geom.features.properties.status', 'Inactive'] }, then: 'true', else: 'false' } },
  // //             'properties.terrestrial': { $toString: '$terrestrial' },
  // //             'properties.segment': '$geom.features.properties._id',
  // //             'properties._id': '$_id',
  // //             geometry: '$geom.features.geometry',
  // //
  // //           },
  // //         },
  // //       ], { allowDiskUse: true }).toArray(async (err, lines) => {
  // //         if (err) return 'Error';
  // //         // we'll going to create the master file for ixps
  // //         // lines = await lines.reduce((total, value) => total.concat(value.geom), []);
  // //         lines = `{
  // //                             "type": "FeatureCollection",
  // //                             "features": ${JSON.stringify(lines)}
  // //                         }`;
  // //         try {
  // //           const stream = await fs.createWriteStream('./temp/cables_subsea.json');
  // //           stream.write(lines);
  // //           stream.on('err', () => {
  // //             console.log('Error to create the file');
  // //           });
  // //           stream.end(async () => {
  // //             const stream = await fs.createWriteStream('./temp/cables_subsea.txt');
  // //             stream.write('');
  // //             // stream.on('err', () => notifications('Master file of subsea cables wasn\'t created', new Date()));
  // //             // stream.end(() => notifications('Master file of subsea cables was created', new Date()));
  // //           });
  // //         } catch (err) { return err; }
  // //       });
  // //     }).catch((e) => e);
  // //   } catch (e) { return e; }
  // // },
  cls: () => {
    try {
      console.log('Creating CLS');
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
              name: { $concat: ['$name', ', ', { $ifNull: ['$country', ''] }] },
            },
          },
          {
            $addFields: {
              feature: {
                type: 'Feature',
                _id: { $toString: '$_id' },
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
        ], { allowDiskUse: true }).toArray(async (err, multipoints) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          console.log(multipoints);
          let id = 0;
          multipoints = await multipoints.reduce((total, value) => {
            id++;
            value.feature.id = id;
            return total.concat(value.feature);
          }, []);
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
                _id: { $toString: '$_id' },
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
        ], { allowDiskUse: true }).toArray(async (err, multipoints) => {
          if (err) return 'Error';

          console.log(multipoints);
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
            $addFields: {
              organizations: [],
            },
          },
          // {
          //   $lookup: {
          //     from: 'networks',
          //     let: { facility: '$_id' },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $in: ['$$facility', '$facilities'],
          //           },
          //         },
          //       },
          //       {
          //         $project: {
          //           _id: 1,
          //           name: 1,
          //           organizations: 1,
          //         },
          //       },
          //     ],
          //     as: 'networks',
          //   },
          // },
          // {
          //   $lookup: {
          //     from: 'organizations',
          //     let: { orgs: '$networks.organizations' },
          //     pipeline: [
          //       {
          //         $addFields: {
          //           idsorgs: { $cond: { if: { $gte: [{ $size: '$$orgs' }, 1] }, then: '$$orgs', else: [] } },
          //         },
          //       },
          //       {
          //         $addFields: {
          //           idsorgs: { $cond: { if: { $gt: [{ $size: '$idsorgs' }, 0] }, then: { $arrayElemAt: ['$idsorgs', 0] }, else: [] } },
          //         },
          //       },
          //       {
          //         $match: {
          //           $expr: {
          //             $in: ['$_id', '$idsorgs'],
          //           },
          //         },
          //       },
          //       {
          //         $project: {
          //           _id: 1,
          //           name: 1,
          //           premium: 1,
          //         },
          //       },
          //     ],
          //     as: 'organizations',
          //   },
          // },
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
              'feature._id': { $toString: '$_id' },
              'feature.properties': {
                _id: { $toString: '$_id' },
                name: '$name',
                address: { $arrayElemAt: ['$address.street', 0] },
                type: 'facility',
                height: '$height',
                premium: '',
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
        ], { allowDiskUse: true }).toArray(async (err, polygon) => {
          console.log(err, polygon);
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
  facilitiesPoints: () => {
    try {
      const facility = require('../models/facility.model');
      facility().then((facility) => {
        facility.aggregate([
          // {
          //   $lookup: {
          //     from: 'networks',
          //     let: { facility: '$_id' },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $in: ['$$facility', '$facilities'],
          //           },
          //         },
          //       },
          //       {
          //         $project: {
          //           _id: 1,
          //           name: 1,
          //           organizations: 1,
          //         },
          //       },
          //     ],
          //     as: 'networks',
          //   },
          // },
          // {
          //   $lookup: {
          //     from: 'organizations',
          //     let: { orgs: '$networks.organizations' },
          //     pipeline: [
          //       {
          //         $addFields: {
          //           idsorgs: { $cond: { if: { $gte: [{ $size: '$$orgs' }, 1] }, then: '$$orgs', else: [] } },
          //         },
          //       },
          //       {
          //         $addFields: {
          //           idsorgs: { $cond: { if: { $gt: [{ $size: '$idsorgs' }, 0] }, then: { $arrayElemAt: ['$idsorgs', 0] }, else: [] } },
          //         },
          //       },
          //       {
          //         $match: {
          //           $expr: {
          //             $in: ['$_id', '$idsorgs'],
          //           },
          //         },
          //       },
          //       {
          //         $project: {
          //           _id: 1,
          //           name: 1,
          //           premium: 1,
          //         },
          //       },
          //     ],
          //     as: 'organizations',
          //   },
          // },
          {
            $addFields: {
              feature: {
                type: 'Feature',
                geometry: { $arrayElemAt: ['$geom.features.geometry', 0] },
              },
              height: { $arrayElemAt: ['$geom.features.properties.height', 0] },
            },
          },
          // {
          //   $addFields: {
          //     premium: { $cond: { if: { $gt: [{ $size: '$organizations' }, 0] }, then: { $cond: { if: { $in: [true, '$organizations.premium'] }, then: true, else: false } }, else: false } },
          //   },
          // },
          {
            $addFields: {
              'feature._id': { $toString: '$_id' },
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
        ], { allowDiskUse: true }).toArray(async (err, polygon) => {
          if (err) return 'Error';
          // we'll going to create the master file for ixps
          const turf = require('@turf/turf');
          const zero = ",{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } }";
          polygon = await polygon.reduce((total, value) => total.concat(turf.centroid(value.feature)), []);
          polygon = `{
                              "type": "FeatureCollection",
                              "features": ${JSON.stringify(polygon)}
                          }`;
          polygon = await polygon.replace(zero, '');
          try {
            const stream = await fs.createWriteStream('./temp/facilities.points.json');
            stream.write(polygon);
            stream.on('err', () => {
              console.log('Error to create the file');
            });
            stream.end(async () => {
              const stream = await fs.createWriteStream('./temp/facilities.points.txt');
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
