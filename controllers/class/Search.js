const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Search {
  constructor() {
    this.model = require('../../models/cable.model');
  }

  cables(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((cables) => {
          const strIdExpr = { $toString: '$_id' };
          const searchFields = ['$name', strIdExpr];
          const makeSearchExpr = (fields, query) => ({
            $or: fields.map((field) => ({
              $gte: [{ $indexOfCP: [{ $toLower: field }, query.toLowerCase()] }, 0],
            })),
          });
          cables.aggregate([
            {
              $match: {
                $expr: makeSearchExpr(searchFields, search),
              },
            },
            {
              $addFields: {
                t: 'cable',
              },
            },{
              $project: {
                _id: 1,
                name: 1,
                t: 1,
              },
            },
          ]).toArray((err, rCables) => {
            if (err) reject(err);
            resolve({ m: 'Loaded', r: rCables });
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  cls() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  networks() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  facilities() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  ixps() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  byField(user, data) {
    return new Promise((resolve, reject) => {
      try {
        Promise.all([this.cables(data)]).then((r) => {
          resolve(r);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Search;
