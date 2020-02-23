module.exports = {
  callEndPoints: (router, controllers, response ) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/cls/add`, (req, res) => {
      // console.log((req.headers.authorization, req.headers.user_id));
      controllers.cableLandingStations.add(req.headers.user_id, req.body)
         .then((r) => { response.success(res, r); })
         .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/cls/edit`, (req, res) => {
      controllers.cableLandingStations.edit(req.headers.user_id, req.body)
         .then((r) => { response.success(res, r); })
         .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cls/all`, (req, res) => {
      controllers.cableLandingStations.list(req.headers.user_id)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });

    router.delete(`${process.env._ROUTE}/auth/cls/delete/:id`, (req, res) => {
      controllers.cableLandingStations.delete(req.headers.user_id, req.params.id)
         .then((r) => { response.success(res, r); })
         .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/auth/cls/owner/:id`, (req, res) => {
      controllers.cableLandingStations.owner(req.headers.user_id, req.params.id)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/cls/box/:id`, (req, res) => {
      controllers.cableLandingStations.bbox(req.headers.user_id, req.params.id)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/view/:id`, statics, (req, res) => {
      controllers.cableLandingStations.view(req.headers.user_id, req.params.id)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/search`, statics, (req, res) => {
      controllers.cableLandingStations.search(req.headers.user_id, req.query.s)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/geom/:id`, statics, (req, res) => {
      controllers.cableLandingStations.getElementGeom(req.headers.user_id, req.params.id)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });
  },
};
