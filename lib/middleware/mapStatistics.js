const luxon = require('luxon');
const statics = require('../../models/mapStatistics.model');

function mps(req, res, next) {
  statics().then((statics) => {
    let data = {
      query: req.query,
    };
    statics.insert(data, (err, i) => {
      next();
    });
  }).catch((e) => next());
}

module.exports = mps
