module.exports = {
  callEndPoints: (router, controllers, response) => {
    // const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/peeringdb/ixpconnections`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.getIxpConnections()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/peeringdb/facilitiesuinformation`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.getFacilitiesInformation()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
