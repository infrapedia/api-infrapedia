const luxon = require('luxon');
const statics = require('../../models/statistic.model');

function secured(req, res, next) {
  statics().then((statics) => {
    let data = {
      uuid: req.headers.userid,
      path: req.path,
      query: req.query,
      params: req.params,
      rgDate: luxon.DateTime.utc(),
    };
    statics.insert(data, (err, i) => {
      next();
    });
  }).catch((e) => next());
}

module.exports = secured
