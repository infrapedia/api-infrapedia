module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/cloud/add`, (req, res) => {
      // console.log((req.headers.authorization, req.headers.userid));
      controllers.cableLandingStations.add(req.headers.userid, req.body)
        .then((r) => {
          response.success(res, r);
        })
        .catch((e) => {
          response.err(res, e);
        });
    });

    router.put(`${process.env._ROUTE}/auth/cloud/edit`, (req, res) => {
      controllers.cableLandingStations.edit(req.headers.userid, req.body)
        .then((r) => {
          response.success(res, r);
        })
        .catch((e) => {
          response.err(res, e);
        });
    });

    router.get(`${process.env._ROUTE}/auth/cloud/owner/:id`, (req, res) => {
      controllers.cloud.owner(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/cloud/search`, statics, (req, res) => {
      controllers.cloud.search(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/auth/cloud/all`, (req, res) => {
      controllers.cloud.list(req.headers.userid, req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
