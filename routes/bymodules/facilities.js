module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/facilities/transfer`, (req, res) => {
      controllers.facilities.transferFacilities()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/facilities/search`, statics, (req, res) => {
      controllers.facilities.search(req.headers.user_id, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/facilities/view/:id`, statics, (req, res) => {
      controllers.facilities.view(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/box/:id`, (req, res) => {
      controllers.facilities.bbox(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/geom/:id`, statics, (req, res) => {
      controllers.facilities.getElementGeom(req.headers.user_id, req.params.id)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });
  },
};
