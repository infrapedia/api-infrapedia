module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/issues/report`, (req, res) => {
      // console.log(req.body)
      controllers.issues.addReport(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/issues/reports`, (req, res) => {
      controllers.issues.reports(req.headers.userid, req.query.page)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/issues/myreports`, (req, res) => {
      controllers.issues.myReports(req.headers.userid, req.query.page)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/issues/view/:elemnt/:id`, (req, res) => {
      controllers.issues.viewReport(req.headers.userid, req.params.id, req.params.elemnt)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/issues/delete/:id`, (req, res) => {
      controllers.issues.deleteMyReport(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
