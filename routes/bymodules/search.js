module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/search/field`, statics, (req, res) => {
      controllers.searchs.byField(req.headers.userid, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/search/field/cables`, statics, (req, res) => {
      controllers.searchs.byFieldCables(req.headers.userid, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/search/field/cls`, statics, (req, res) => {
      controllers.searchs.byFieldCls(req.headers.userid, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/search/field/networks`, statics, (req, res) => {
      controllers.searchs.byFieldNetworks(req.headers.userid, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/search/field/orgs`, statics, (req, res) => {
      controllers.searchs.byFieldOrgs(req.headers.userid, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/search/field/facilities`, statics, (req, res) => {
      controllers.searchs.byFieldFacility(req.headers.userid, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/search/field/ixps`, statics, (req, res) => {
      controllers.searchs.byFieldIXP(req.headers.userid, req.query.s)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
