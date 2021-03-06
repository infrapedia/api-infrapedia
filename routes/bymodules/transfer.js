module.exports = {
  callEndPoints: (router, controllers, response) => {
    router.get(`${process.env._ROUTE}/transfer/organizations`, (req, res) => {
      controllers.transfer.organizations()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/organizationsixp`, (req, res) => {
      controllers.transfer.organizationIXP()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/facilities`, (req, res) => {
      controllers.transfer.facilities()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/ixps`, (req, res) => {
      controllers.transfer.ixps()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/cls`, (req, res) => {
      controllers.transfer.cls()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/cables`, (req, res) => {
      controllers.transfer.cables()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/orgixps`, (req, res) => {
      controllers.transfer.orgIxps()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/orgfacilities`, (req, res) => {
      controllers.transfer.orgFacilities()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/transfer/connectionixpwfac`, (req, res) => {
      controllers.InternetExchangePoints.connectionIXPFAC()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/connectionorgwixp`, (req, res) => {
      controllers.organizations.connectionORGIXP()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/connectionorgwfac`, (req, res) => {
      controllers.organizations.connectionORGFAC()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/transfer/connectionoguasn`, (req, res) => {
      controllers.organizations.connectionUASN()
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
