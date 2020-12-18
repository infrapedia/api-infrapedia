module.exports = {
  callEndPoints: (router, controllers, response) => {
    // const statics = require('../../lib/middleware/statics');
    router.get(`${process.env._ROUTE}/peeringdb/orgconnectionixp`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.getIXPSConnection(req.query.org)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/peeringdb/getixpbylocation`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.getIXPSConnectionByLocation(req.query.location)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/peeringdb/getmyconnections`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.getMyConnection(req.query.org)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });

  },
};
