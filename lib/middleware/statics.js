const luxon = require('luxon');
const statics = require('../../models/statistic.model');

function secured(req, res, next) {
  if(req.headers.user_id !== ''){
    statics().then((statics) => {
      let data = {
        uuid: req.headers.userid,
        path: req.path,
        query: req.query,
        params: req.params,
        rgDate: luxon.DateTime.utc(),
      };
      statics.insertOne(data, (err, i) => {
        next();
      });
    }).catch((e) => next());
  } else {
    next();
  }
}

module.exports = secured
