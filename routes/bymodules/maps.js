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

    router.get(`${process.env._ROUTE}/map/info/:subdomain`, (req, res) => {
      controllers.maps.getInfo(req.params.subdomain)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => { response.err(res, e); });
    });

    router.get(`${process.env._ROUTE}/map/v/:subdomain`, (req, res) => {

    });
  },
};
