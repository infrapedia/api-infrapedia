function cables(search){
  return new Promise((resolve) => {
    const cable = require('../models/cable.model');
    cable().then((cable) => {
      cable.aggregate([
        {
          $unwind:
             {
               path: '$tags',
               preserveNullAndEmptyArrays: true,
             },
        },
        {
          $match: { tags: { $regex: search, $options: 'i' } },
        },
        {
          $group: {
            _id: '$tags',
          },
        },
      ]).toArray(async (err, r) => {
        if (r.length > 0) {
          resolve(await r.reduce((total, value) => total.concat(value._id), []));
        } else {
          resolve(r);
        }
      });
    }).catch((e) => resolve([]));
  });
}
function cls(search){
  return new Promise((resolve) => {
    const cls = require('../models/cls.model');
    cls().then((cls) => {
      cls.aggregate([
        {
          $unwind:
             {
               path: '$tags',
               preserveNullAndEmptyArrays: true,
             },
        },
        {
          $match: { tags: { $regex: search, $options: 'i' } },
        },
        {
          $group: {
            _id: '$tags',
          },
        },
      ]).toArray(async (err, r) => {
        if (r.length > 0) {
          resolve(await r.reduce((total, value) => total.concat(value._id), []));
        } else {
          resolve(r);
        }
      });
    }).catch((e) => resolve([]));
  });
}
function ixps(search){
  return new Promise((resolve) => {
    const ixp = require('../models/ixp.model');
    ixp().then((ixp) => {
      ixp.aggregate([
        {
          $unwind:
             {
               path: '$tags',
               preserveNullAndEmptyArrays: true,
             },
        },
        {
          $match: { tags: { $regex: search, $options: 'i' } },
        },
        {
          $group: {
            _id: '$tags',
          },
        },
      ]).toArray(async (err, r) => {
        if (r.length > 0) {
          resolve(await r.reduce((total, value) => total.concat(value._id), []));
        } else {
          resolve(r);
        }
      });
    }).catch((e) => resolve([]));
  });
}
function facilities(search) {
  return new Promise((resolve) => {
    const facility = require('../models/facility.model');
    facility().then((facility) => {
      facility.aggregate([
        {
          $unwind:
             {
               path: '$tags',
               preserveNullAndEmptyArrays: true,
             },
        },
        {
          $match: { tags: { $regex: search, $options: 'i' } },
        },
        {
          $group: {
            _id: '$tags',
          },
        },
      ]).toArray(async (err, r) => {
        if (r.length > 0) {
          resolve(await r.reduce((total, value) => total.concat(value._id), []));
        } else {
          resolve(r);
        }
      });
    }).catch((e) => resolve([]));
  });
}
function networks(search){
  return new Promise((resolve) => {
    const network = require('../models/network.model');
    network().then((network) => {
      network.aggregate([
        {
          $unwind:
             {
               path: '$tags',
               preserveNullAndEmptyArrays: true,
             },
        },
        {
          $match: { tags: { $regex: search, $options: 'i' } },
        },
        {
          $group: {
            _id: '$tags',
          },
        },
      ]).toArray(async (err, r) => {
        if (r.length > 0) {
          resolve(await r.reduce((total, value) => total.concat(value._id), []));
        } else {
          resolve(r);
        }
      });
    }).catch((e) => resolve([]));
  });
}
module.exports = (s) => new Promise((resolve, reject) => {
  try {
    Promise.all([cables(s), cls(s), ixps(s), facilities(s), networks(s)]).then(async (r) => {
      // eslint-disable-next-line no-underscore-dangle
      resolve(await r.reduce((total, value) => total.concat(value), []));
    }).catch((e) => { reject({ m: e }); });
  } catch (e) { reject({ m: e }); }
})
