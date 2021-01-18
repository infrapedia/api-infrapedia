const { ObjectID } = require('mongodb');
const redisClient = require('../../config/redis');

class Cluster {
  constructor() {
    this.model = require('../../models/organization.model');
  }

  network(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/network.model');
        this.model().then((networks) => {
          networks.aggregate([
            {
              $match: {
                _id: new ObjectID(id),
              },
            },
            {
              $lookup: {
                from: 'facilities',
                let: { f: '$facilities' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      point: 1,
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', {
                          $cond: {
                            if: { $isArray: '$$f' },
                            then: '$$f',
                            else: [],
                          },
                        },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      point: '$point',
                    },
                  },
                ],
                as: 'facilities',
              },
            },
            {
              $lookup: {
                from: 'cls',
                let: { f: '$cls' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      geom: 1,
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', {
                          $cond: {
                            if: { $isArray: '$$f' },
                            then: '$$f',
                            else: [],
                          },
                        },
                        ],
                      },
                    },
                  },
                  {

                    $addFields: {
                      point: { $arrayElemAt: ['$geom.features.geometry', 0] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      point: 1,
                    },
                  },
                ],
                as: 'cls',
              },
            },
            {
              $lookup: {
                from: 'cables',
                let: { f: '$cables' },
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      geom: 1,
                    },
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ['$_id', {
                          $cond: {
                            if: { $isArray: '$$f' },
                            then: '$$f',
                            else: [],
                          },
                        },
                        ],
                      },
                    },
                  },
                  {
                    $addFields: {
                      // v: { $arrayElemAt: ['$geom.geometry.coordinates', '$sizeFeature'] },
                      v: { $arrayElemAt: [{ $arrayElemAt: ['$geom.features.geometry.coordinates', 0] }, 0] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      point: { type: 'Point', coordinates: '$v' },
                    },
                  },
                ],
                as: 'cables',
              },
            },
            {
              $project: {
                points: { $concatArrays: ['$cables.point', '$cls.point', '$facilities.point'] },
              },
            },
          ]).toArray(async (err, points) => {
            points = await points[0].points.map((value) => ({ type: 'Feature', properties: {}, geometry: value }), []);
            points = {
              type: 'FeatureCollection',
              features: points,
            };
            resolve({ m: 'Loaded', r: points });
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  // organization(id) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.model().then((organization) => {
  //         organization.aggregate([
  //           {
  //             $match: {
  //               _id: new ObjectID(id),
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: 'networks',
  //               let: { f: '$_id' },
  //               pipeline: [
  //                 {
  //                   $match: {
  //                     $expr: {
  //                       in: ['$$f', '$organizations'],
  //                     },
  //                   },
  //                 },
  //                 {
  //                   $addFields: {
  //                     org: '$$f',
  //                   },
  //                 },
  //                 {
  //                   $lookup: {
  //                     from: 'facilities',
  //                     let: { f: '$facilities' },
  //                     pipeline: [
  //                       {
  //                         $project: {
  //                           _id: 1,
  //                           point: 1,
  //                         },
  //                       },
  //                       {
  //                         $match: {
  //                           $expr: {
  //                             $in: ['$_id', {
  //                               $cond: {
  //                                 if: { $isArray: '$$f' },
  //                                 then: '$$f',
  //                                 else: [],
  //                               },
  //                             },
  //                             ],
  //                           },
  //                         },
  //                       },
  //                       {
  //                         $project: {
  //                           _id: 1,
  //                           point: '$point',
  //                         },
  //                       },
  //                     ],
  //                     as: 'facilities',
  //                   },
  //                 },
  //                 {
  //                   $lookup: {
  //                     from: 'cls',
  //                     let: { f: '$cls' },
  //                     pipeline: [
  //                       {
  //                         $project: {
  //                           _id: 1,
  //                           geom: 1,
  //                         },
  //                       },
  //                       {
  //                         $match: {
  //                           $expr: {
  //                             $in: ['$_id', {
  //                               $cond: {
  //                                 if: { $isArray: '$$f' },
  //                                 then: '$$f',
  //                                 else: [],
  //                               },
  //                             },
  //                             ],
  //                           },
  //                         },
  //                       },
  //                       {
  //
  //                         $addFields: {
  //                           point: { $arrayElemAt: ['$geom.features.geometry', 0] },
  //                         },
  //                       },
  //                       {
  //                         $project: {
  //                           _id: 1,
  //                           point: 1,
  //                         },
  //                       },
  //                     ],
  //                     as: 'cls',
  //                   },
  //                 },
  //                 {
  //                   $lookup: {
  //                     from: 'cables',
  //                     let: { f: '$cables' },
  //                     pipeline: [
  //                       {
  //                         $project: {
  //                           _id: 1,
  //                           geom: 1,
  //                         },
  //                       },
  //                       {
  //                         $match: {
  //                           $expr: {
  //                             $in: ['$_id', {
  //                               $cond: {
  //                                 if: { $isArray: '$$f' },
  //                                 then: '$$f',
  //                                 else: [],
  //                               },
  //                             },
  //                             ],
  //                           },
  //                         },
  //                       },
  //                       {
  //                         $addFields: {
  //                           v: { $arrayElemAt: [{ $arrayElemAt: ['$geom.features.geometry.coordinates', 0] }, 0] },
  //                         },
  //                       },
  //                       {
  //                         $project: {
  //                           _id: 1,
  //                           point: { type: 'Point', coordinates: '$v' },
  //                         },
  //                       },
  //                     ],
  //                     as: 'cables',
  //                   },
  //                 },
  //               ],
  //               as: 'networks',
  //             },
  //
  //           },
  //           {
  //             $project: {
  //               org: '$f',
  //               networks: 1,
  //             },
  //           },
  //           {
  //             $unwind: '$networks',
  //           },
  //           { $replaceRoot: { newRoot: '$networks' } },
  //           {
  //             $project: {
  //               org: 1,
  //               points: { $concatArrays: ['$cables.point', '$cls.point', '$facilities.point'] },
  //             },
  //           },
  //           {
  //             $unwind: '$points',
  //           },
  //           {
  //             $group: {
  //               _id: '$org',
  //               points: { $push: '$points' },
  //             },
  //           },
  //           {
  //             $project: {
  //               points: { $setUnion: '$points' },
  //             },
  //           },
  //         ]).toArray(async (err, points) => {
  //           if (points.length !== 0) {
  //             points = await points[0].points.map((value) => ({ type: 'Feature', properties: {}, geometry: value }), []);
  //             points = {
  //               type: 'FeatureCollection',
  //               features: points,
  //             };
  //             resolve({ m: 'Loaded', r: points });
  //           } else {
  //             points = {
  //               type: 'FeatureCollection',
  //               features: [],
  //             };
  //             resolve({ m: 'Loaded', r: points });
  //           }
  //         });
  //       }).catch((e) => { reject({ m: e }); });
  //     } catch (e) { reject({ m: e }); }
  //   });
  // }

  createOrganizationCluster(id) {
    return new Promise((resolve, reject) => {
      try {
        this.model()
          .then((organization) => {
            organization.aggregate([
              {
                $project: {
                  _id: 1,
                },
              },
              {
                $match: {
                  _id: new ObjectID(id),
                },
              },
              {
                $lookup: {
                  from: 'cls',
                  let: { f: '$_id' },
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        owners: 1,
                        geom: 1,
                      },
                    },
                    {
                      $addFields: {
                        owners: { $ifNull: ['$owners', []] },
                      },
                    },
                    {
                      $match: {
                        $expr: {
                          $in: ['$$f', '$owners'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        point: { $arrayElemAt: ['$geom.features.geometry', 0] },
                      },
                    },
                    {
                      $addFields: {
                        ppdata: {
                          type: 'Feature',
                          properties: {
                            _id: '$_id',
                          },
                          geometry: '$point',
                        },
                      },
                    },
                  ],
                  as: 'cls',
                },
              },
              {
                $lookup: {
                  from: 'facilities',
                  let: { f: '$_id' },
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        owners: 1,
                        point: 1,
                      },
                    },
                    {
                      $addFields: {
                        owners: { $ifNull: ['$owners', []] },
                      },
                    },
                    {
                      $match: {
                        $expr: {
                          $in: ['$$f', '$owners'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        ppdata: {
                          type: 'Feature',
                          properties: {
                            _id: '$_id',
                          },
                          geometry: '$point',
                        },
                      },
                    },
                  ],
                  as: 'facilities',
                },
              },
              {
                $lookup: {
                  from: 'facilities',
                  let: { f: '$_id' },
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        owners: 1,
                        point: 1,
                      },
                    },
                    {
                      $addFields: {
                        knownUsers: { $ifNull: ['$knownUsers', []] },
                      },
                    },
                    {
                      $match: {
                        $expr: {
                          $in: ['$$f', '$knownUsers'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        ppdata: {
                          type: 'Feature',
                          properties: {
                            _id: '$_id',
                          },
                          geometry: '$point',
                        },
                      },
                    },
                  ],
                  as: 'facilitiesKnownUsers',
                },
              },
              {
                $lookup: {
                  from: 'ixps',
                  let: { f: '$_id' },
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        owners: 1,
                        geom: 1,
                      },
                    },
                    {
                      $addFields: {
                        owners: { $ifNull: ['$owners', []] },
                      },
                    },
                    {
                      $match: {
                        $expr: {
                          $in: ['$$f', '$owners'],
                        },
                      },
                    },
                    {
                      $addFields: {
                        point: '$geom',
                      },
                    },
                    {
                      $addFields: {
                        ppdata: {
                          type: 'Feature',
                          properties: {
                            _id: '$_id',
                          },
                          geometry: '$point',
                        },
                      },
                    },
                  ],
                  as: 'ixps',
                },
              },
            ], { allowDiskUse: true }).toArray(async (err, points) => {
              if (err) reject({ m: err });
              let data = [];
              if (Array.isArray(points)) {
                points[0].cls.map((i) => data.push(i.ppdata));
                points[0].facilities.map((i) => data.push(i.ppdata));
                points[0].ixps.map((i) => data.push(i.ppdata));
                points[0].facilitiesKnownUsers.map((i) => data.push(i.ppdata));
                // if(points[0].cls > 0) data.push(await points[0].cls.reduce((total, value) => total.concat(value.ppdata), []));
                // if(points[0].facilities > 0) data.push(await points[0].facilities.reduce((total, value) => total.concat(value.ppdata), []));
                // if(points[0].ixps > 0) data.push(await points[0].ixps.reduce((total, value) => total.concat(value.ppdata), []));
              }
              // data = await data.map((i) => ((i.length > 0) ? i : ''));
              // data.filter(Boolean);
              points = {
                type: 'FeatureCollection',
                features: data,
              };
              redisClient.set(`v_co_${id}`, JSON.stringify(points), 'EX', 172800);
              resolve({ m: 'Loaded', r: points });
            });
          });
      } catch (e) { reject({ m: e }); }
    });
  }


  organizationsCluster() {
    return new Promise((resolve, reject) => {
      try {
        this.model()
          .then((organization) => {
            organization.aggregate(
              [
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
            ).toArray((err, orgs) => {
              if (err) reject({ m: err });
              Promise.all([orgs.map((i) => this.createOrganizationCluster(i._id))])
                .then((r) => {
                  resolve({ m: 'Data created' });
                }).catch((e) => {
                  reject({ m: e });
                });
            });
          });
      } catch (e) {
        reject({ m: e });
      }
    });
  }
}
module.exports = Cluster;
