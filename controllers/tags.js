function cables(search) {
  return new Promise((resolve) => {
    const cable = require('../models/cable.model');
    cable().then((cable) => {
      cable.aggregate([
        {
          $match: {
            tags: { $regex: search, $options: 'i' },
          },
        },
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
          $group: { _id: '$tags' }, //doc: { $first: '$$ROOT.tags' }
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
function cls(search) {
  return new Promise((resolve) => {
    const cls = require('../models/cls.model');
    cls().then((cls) => {
      cls.aggregate([
        {
          $match: {
            tags: { $regex: search, $options: 'i' },
          },
        },
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
function ixps(search) {
  return new Promise((resolve) => {
    const ixp = require('../models/ixp.model');
    ixp().then((ixp) => {
      ixp.aggregate([
        {
          $match: {
            tags: { $regex: search, $options: 'i' },
          },
        },
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
          $match: {
            tags: { $regex: search, $options: 'i' },
          },
        },
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
function networks(search) {
  return new Promise((resolve) => {
    const network = require('../models/network.model');
    network().then((network) => {
      network.aggregate([
        {
          $match: {
            tags: { $regex: search, $options: 'i' },
          },
        },
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
      const listOfTags = r.reduce((total, value) => total.concat(value), []);
      // listOfTags.filter((item, index) => listOfTags.indexOf(item) === index)
      resolve(await [...new Set(listOfTags)].filter(Boolean));
    }).catch((e) => { reject({ m: e }); });
  } catch (e) { reject({ m: e }); }
});
