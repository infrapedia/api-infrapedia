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
  }
};
