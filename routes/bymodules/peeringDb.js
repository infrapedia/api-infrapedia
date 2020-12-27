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
    router.get(`${process.env._ROUTE}/peeringdb/facilitiesuinformationid`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.getFacilitiesInformationById(req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/peeringdb/updateFacilityPoint`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.updateGeoJsonPointFacilities()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/peeringdb/updateIXPPoint`, (req, res) => {
      req.setTimeout(3600000);
      controllers.peeringDb.updateGeoJsonPointIXP()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
