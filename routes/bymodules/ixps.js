module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/ixps/transfer`, (req, res) => {
      controllers.InternetExchangePoints.transferIXPS()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/ixps/search`, statics, (req, res) => {
      controllers.InternetExchangePoints.search(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/ixps/owner/:id`, (req, res) => {
      controllers.InternetExchangePoints.owner(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/ixps/view/:id`, statics, (req, res) => {
      controllers.InternetExchangePoints.view(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/ixps/box/:id`, (req, res) => {
      controllers.InternetExchangePoints.bbox(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/ixps/geom/:id`, (req, res) => {
      controllers.InternetExchangePoints.getElementGeom(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/ixps/geoms`, (req, res) => {
      controllers.InternetExchangePoints.getMultiElementsGeom(req.headers.userid, req.body.ids)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/ixps/add`, (req, res) => {
      controllers.InternetExchangePoints.add(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/ixps/edit`, (req, res) => {
      controllers.InternetExchangePoints.edit(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/ixps/all`, (req, res) => {
      controllers.InternetExchangePoints.list(req.headers.userid, req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/ixps/delete/:id`, (req, res) => {
      controllers.InternetExchangePoints.delete(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/ixps/checkname`, (req, res) => {
      controllers.InternetExchangePoints.checkName(req.query.n)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/ixps/permanentdelete/:id`, (req, res) => {
      controllers.InternetExchangePoints.permanentDelete(req.headers.userid, req.params.id, req.body.code)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/ixps/clusterfacilityconnection/:id`, (req, res) => {
      controllers.InternetExchangePoints.clusterFacilityConnection(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
