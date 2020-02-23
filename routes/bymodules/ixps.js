module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/ixps/transfer`, (req, res) => {
      controllers.InternetExchangePoints.transferIXPS()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/ixps/search`, statics, (req, res) => {
      controllers.InternetExchangePoints.search(req.headers.user_id, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/ixps/view/:id`, statics, (req, res) => {
      controllers.InternetExchangePoints.view(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/ixps/box/:id`, (req, res) => {
      controllers.InternetExchangePoints.bbox(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/ixps/geom/:id`, statics, (req, res) => {
      controllers.InternetExchangePoints.getElementGeom(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
