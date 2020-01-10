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
                $expr: makeSearchExpr(searchFields, search.toLowerCase()),
                deleted: false,
              },
            },
            {
              $addFields: {
                t: 'cable',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                t: 1,
              },
            },
          ]).toArray((err, rCables) => {
            if (err) reject(err);
            resolve(rCables);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  cls(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/cls.model');
        this.model().then((cls) => {
          const strIdExpr = { $toString: '$_id' };
          const searchFields = ['$name', strIdExpr];
          const makeSearchExpr = (fields, query) => ({
            $or: fields.map((field) => ({
              $gte: [{ $indexOfCP: [{ $toLower: field }, query.toLowerCase()] }, 0],
            })),
          });
          cls.aggregate([
            {
              $match: {
                $expr: makeSearchExpr(searchFields, search),
                deleted: false,
              },
            },
            {
              $addFields: {
                t: 'cls',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                t: 1,
              },
            },
          ]).toArray((err, rCls) => {
            if (err) reject(err);
            resolve(rCls);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }

  networks(search) {
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/network.model');
        this.model().then((network) => {
          const strIdExpr = { $toString: '$_id' };
          const searchFields = ['$name', strIdExpr];
          const makeSearchExpr = (fields, query) => ({
            $or: fields.map((field) => ({
              $gte: [{ $indexOfCP: [{ $toLower: field }, query.toLowerCase()] }, 0],
            })),
          });
          network.aggregate([
            {
              $match: {
                $expr: makeSearchExpr(searchFields, search),
              },
            },
            {
              $addFields: {
                t: 'network',
              },
            },{

            },{
              $project: {
                _id: 1,
                name: 1,
                organizations: 1,
                facilities: 1,
                cables: 1,
                cls: 1,
                t: 1,
              },
            },
          ]).toArray((err, rCls) => {
            if (err) reject(err);
            resolve(rCls);
          });
        }).catch((e) => { reject({ m: e }); });
      } catch (e) {}
    });
  }

  orgs(search){
    return new Promise((resolve, reject) => {
      try {
        this.model = require('../../models/network.model');
        this.model().then((network) => {
          const strIdExpr = { $toString: '$_id' };
          const searchFields = ['$name', strIdExpr];
          const makeSearchExpr = (fields, query) => ({
            $or: fields.map((field) => ({
              $gte: [{ $indexOfCP: [{ $toLower: field }, query.toLowerCase()] }, 0],
            })),
          });
          network.aggregate([
            {
              $match: {
                $expr: makeSearchExpr(searchFields, search),
              },
            },
            {
              $addFields: {
                t: 'network',
              },
            },{
              $project: {
                _id: 1,
                name: 1,
                organizations: 1,
                facilities: 1,
                cables: 1,
                cls: 1,
                t: 1,
              },
            },
          ]).toArray((err, rCls) => {
            if (err) reject(err);
            resolve(rCls);
          });
        }).catch((e) => { reject({ m: e }); });
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
          resolve(r[0]);
        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Search;
