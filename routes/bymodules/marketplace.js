module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/marketplace/list`, (req, res) => {
      controllers.marketplace.getList()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
