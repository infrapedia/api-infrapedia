const { ObjectID } = require('mongodb');

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

  organization(id){
    return new Promise((resolve, reject) => {

    });
  }
}
module.exports = Cluster;
