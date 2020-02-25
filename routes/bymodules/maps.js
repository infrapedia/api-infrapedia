module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/map/mymap`, (req, res) => {
      controllers.maps.myMap(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/map/mymap`, (req, res) => {
      controllers.maps.getMyMap(req.headers.userid)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
