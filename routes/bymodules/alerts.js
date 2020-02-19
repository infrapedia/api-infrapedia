module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/alerts/add`, (req, res) => {
      // console.log((req.headers.authorization, req.headers.user_id));
      controllers.alerts.add(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.patch(`${process.env._ROUTE}/auth/alerts/disabled`, (req, res) => {
      // console.log((req.headers.authorization, req.headers.user_id));
      controllers.alerts.disabled(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/alerts/configured`, (req, res) => {
      // console.log((req.headers.authorization, req.headers.user_id));
      controllers.alerts.configuredAlerts(req.headers.user_id, req.query.page)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/alerts/config/provider/email`, (req, res) => {
      controllers.alertsProviders.configProviderEmail(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/alerts/provider/email`, (req, res) => {
      controllers.alertsProviders.getEmailProvider(req.headers.user_id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/alerts/provider/send/email`, (req, res) => {
      controllers.alertsProviders.sendEmail(req.headers.user_id, req.body)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
