module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/network/add`, (req, res) => {
      // console.log((req.headers.authorization, req.headers.user_id));
      controllers.networks.add(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.put(`${process.env._ROUTE}/auth/network/edit`, (req, res) => {
      controllers.networks.edit(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/network/all`, (req, res) => {
      controllers.networks.list(req.headers.user_id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/network/delete/:id`, (req, res) => {
      controllers.networks.delete(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r); })
         .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/network/owner/:id`, (req, res) => {
      controllers.networks.owner(req.headers.user_id, req.params.id)
        .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/network/view/:id`, statics, (req, res) => {
      controllers.networks.view(req.headers.user_id, req.params.id)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/network/search`, statics, (req, res) => {
      controllers.networks.search(req.headers.user_id, req.query.s)
         .then((r) => { response.success(res, r, false); })
         .catch((e) => { response.err(res, e); });
    });
  },
};
