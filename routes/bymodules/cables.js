module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/cables/add`, (req, res) => {
      req.setTimeout(3600000);
      controllers.cables.add(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/cables/edit`, (req, res) => {
      controllers.cables.edit(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cables/all`, (req, res) => {
      controllers.cables.list(req.headers.user_id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cables/shortlist`, (req, res) => {
      controllers.cables.shortList(req.headers.user_id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/cables/delete/:id`, (req, res) => {
      controllers.cables.delete(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/cables/owner/:id`, (req, res) => {
      controllers.cables.owner(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/box/:id`, (req, res) => {
      controllers.cables.bbox(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/view/:id`, statics, (req, res) => {
      controllers.cables.view(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/search`, statics, (req, res) => {
      console.log(req.headers.user_id);
      controllers.cables.search(req.headers.user_id, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cables/geom/:id`, statics, (req, res) => {
      controllers.cables.getElementGeom(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/cables/geoms`, statics, (req, res) => {
      controllers.cables.getMultiElementsGeom(req.headers.user_id, req.body.ids)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
