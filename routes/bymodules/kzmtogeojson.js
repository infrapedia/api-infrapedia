module.exports = {
  callEndPoints: (router, controllers, response ) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/kmz/lines/togeojson`, (req, res) => {
      controllers.convert.kmzToGeojsonLines(req.headers.user_id, req.body)
         .then((r) => { response.success(res, r); })
         .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/kmz/points/togeojson`, (req, res) => {
      controllers.convert.kmzToGeojsonPoints(req.headers.user_id, req.body)
         .then((r) => { response.success(res, r); })
         .catch((e) => { response.err(res, e); });
    });
  },
};
