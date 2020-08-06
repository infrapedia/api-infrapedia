module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/map/mymap`, (req, res) => {
      controllers.maps.myMap(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/map/mymap`, (req, res) => {
      controllers.maps.getMyMap(req.headers.userid)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/ixps/:subdomain`, (req, res) => {
      controllers.maps.ixps(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/facilities/:subdomain`, (req, res) => {
      controllers.maps.facilities(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/cls/:subdomain`, (req, res) => {
      controllers.maps.cls(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/map/draw/:subdomain`, (req, res) => {
      controllers.maps.draw(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/map/cables/:subdomain`, (req, res) => {
      controllers.maps.cables(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/setinfo/:subdomain`, (req, res) => {
      controllers.maps.setInfo(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/map/info/:subdomain`, (req, res) => {
      controllers.maps.getInfo(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });

    // get data for map
    router.get(`${process.env._ROUTE}/map/get/cables/:subdomain`, (req, res) => {
      controllers.maps.getCables(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/get/cls/:subdomain`, (req, res) => {
      controllers.maps.getCls(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/get/ixps/:subdomain`, (req, res) => {
      controllers.maps.getIxps(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/get/facilities/:subdomain`, (req, res) => {
      controllers.maps.getFacilities(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/get/draw/:subdomain`, (req, res) => {
      controllers.maps.getDraw(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/map/get/info/:subdomain`, (req, res) => {
      controllers.maps.getDataInfo(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });
  },
};
