module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/facilities/transfer`, (req, res) => {
      controllers.facilities.transferFacilities()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/facilities/search`, statics, (req, res) => {
      controllers.facilities.search(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/facilities/owner/:id`, (req, res) => {
      controllers.facilities.owner(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/facilities/view/:id`, statics, (req, res) => {
      controllers.facilities.view(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/box/:id`, (req, res) => {
      controllers.facilities.bbox(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/geom/:id`, (req, res) => {
      controllers.facilities.getElementGeom(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/facilities/geoms`, (req, res) => {
      controllers.facilities.getMultiElementsGeom(req.headers.userid, req.body.ids)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/facilities/geomspoints`, (req, res) => {
      controllers.facilities.getMultiElementsGeomPoints(req.headers.userid, req.body.ids)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/facilities/add`, (req, res) => {
      controllers.facilities.add(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/facilities/edit`, (req, res) => {
      controllers.facilities.edit(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/facilities/all`, (req, res) => {
      controllers.facilities.list(req.headers.userid, req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/facilities/delete/:id`, (req, res) => {
      controllers.facilities.delete(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/checkname`, (req, res) => {
      controllers.facilities.checkName(req.query.n)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/checkpeeringdb`, statics, (req, res) => {
      controllers.facilities.checkPeeringDb(req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/facilities/permanentdelete/:id`, (req, res) => {
      controllers.facilities.permanentDelete(req.headers.userid, req.params.id, req.body.code)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/facilities/clustering`, (req, res) => {
      controllers.facilities.clustering()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/facilities/namesbylist`, (req, res) => {
      controllers.facilities.getNamesByList(req.headers.userid, req.body.ids)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/centroid`, (req, res) => {
      controllers.facilities.centroid()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/facilities/checkelements`, (req, res) => {
      controllers.facilities.checkElements(res);
    });
    router.get(`${process.env._ROUTE}/facilities/clusterixpconnection/:id`, (req, res) => {
      controllers.facilities.clusterIxpConnection(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
