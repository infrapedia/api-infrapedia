module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/cables/add`, (req, res) => {
      req.setTimeout(3600000);
      controllers.cables.add(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/cables/edit`, (req, res) => {
      controllers.cables.edit(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cables/terrestrial/all`, (req, res) => {
      controllers.cables.listT(req.headers.userid, req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cables/subsea/all`, (req, res) => {
      controllers.cables.listS(req.headers.userid, req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cables/shortlist`, (req, res) => {
      controllers.cables.shortList(req.headers.userid)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/cables/delete/:id`, (req, res) => {
      controllers.cables.delete(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cables/owner/:id`, (req, res) => {
      controllers.cables.owner(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/box/:id`, (req, res) => {
      controllers.cables.bbox(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/box/edit/:id`, (req, res) => {
      controllers.cables.bboxEdit(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/view/:id`, statics, (req, res) => {
      controllers.cables.view(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/search`, statics, (req, res) => {
      controllers.cables.search(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/search/s`, statics, (req, res) => {
      controllers.cables.searchS(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/search/t`, statics, (req, res) => {
      controllers.cables.searchT(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/geom/:id`, (req, res) => {
      controllers.cables.getElementGeom(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/cables/geoms`, (req, res) => {
      controllers.cables.getMultiElementsGeom(req.headers.userid, req.body.ids)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/relationstransfer`, (req, res) => {
      controllers.cables.relationsTransfer()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/checkname`, (req, res) => {
      controllers.cables.checkName(req.query.n)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/subseacables`, (req, res) => {
      controllers.cables.subSealistByName(res, req);
    });
    router.delete(`${process.env._ROUTE}/auth/cables/permanentdelete/:id`, (req, res) => {
      controllers.cables.permanentDelete(req.headers.userid, req.params.id, req.body.code)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
