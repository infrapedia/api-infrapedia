module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/cls/add`, (req, res) => {
      // console.log((req.headers.authorization, req.headers.userid));
      controllers.cableLandingStations.add(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/cls/edit`, (req, res) => {
      controllers.cableLandingStations.edit(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cls/all`, (req, res) => {
      controllers.cableLandingStations.list(req.headers.userid, req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });

    router.delete(`${process.env._ROUTE}/auth/cls/delete/:id`, (req, res) => {
      controllers.cableLandingStations.delete(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/auth/cls/owner/:id`, (req, res) => {
      controllers.cableLandingStations.owner(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/cls/box/:id`, (req, res) => {
      controllers.cableLandingStations.bbox(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/view/:id`, statics, (req, res) => {
      controllers.cableLandingStations.view(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/search`, statics, (req, res) => {
      controllers.cableLandingStations.search(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/geom/:id`, (req, res) => {
      controllers.cableLandingStations.getElementGeom(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/cls/geoms`, (req, res) => {
      controllers.cableLandingStations.getMultiElementsGeom(req.headers.userid, req.body.ids)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/cls/update/cable`, (req, res) => {
      controllers.cableLandingStations.updateCable(req.headers.userid, req.body)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/cls/remove/cable`, (req, res) => {
      controllers.cableLandingStations.removeCable(req.headers.userid, req.body)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/list/cables/:id`, (req, res) => {
      controllers.cableLandingStations.listOfCables(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/list/connected/:id`, (req, res) => {
      controllers.cableLandingStations.listOfCLSbyCable(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cls/checkname`, (req, res) => {
      controllers.cableLandingStations.checkName(req.query.n)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/cls/permanentdelete/:id`, (req, res) => {
      controllers.cableLandingStations.permanentDelete(req.headers.userid, req.params.id, req.body.code)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
