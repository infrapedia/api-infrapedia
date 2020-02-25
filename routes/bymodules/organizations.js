module.exports = {
  callEndPoints: (router, controllers, response ) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/organization/add`, (req, res) => {
      console.log(req.headers);
      controllers.organizations.add(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/organization/edit`, (req, res) => {
      controllers.organizations.edit(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/organization/all`, (req, res) => {
      controllers.organizations.list(req.headers.user_id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/organization/delete/:id`, (req, res) => {
      controllers.organizations.delete(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/organization/owner/:id`, (req, res) => {
      controllers.organizations.owner(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/view/:id`, statics, (req, res) => {
      controllers.organizations.view(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/search`, statics, (req, res) => {
      controllers.organizations.search(req.headers.user_id, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/partners`, (req, res) => {
      controllers.organizations.partners()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/istrusted`, (req, res) => {
      controllers.organizations.istrusted()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
