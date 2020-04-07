const routes = function (router, controllers) {
  const response = {
    success: (res, answ, n) => {
      res.set(
        {
          'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Max-Age': 600, 'X-Powered-By': 'Infrapedia.com', 'X-Auth-Token': (answ.session) ? answ.session : 'Infrapedia',
        },
      );
      res.status(200).json({ t: 'success', data: answ, n });
    },
    err: (res, answ) => {
      // let msgError = answ.msg.split('|');
      // answ.msg = msgError[0];
      // bugsnagClient.user = {
      //   id: ( req.session.uid ) ? req.session.uid : 'Not login user',
      //   name: ( req.session.name ) ? req.session.name : 'Not login user',
      //   roles: ( req.session.permissions ) ? req.session.permissions : [ 'Not login user']
      // }
      // bugsnagClient.metaData = { company: { name: process.env._DB_NAME } };
      // bugsnagClient.context = req.path;
      // bugsnagClient.notify(new Error( msgError[ 1 ] ) );
      // REPORT CLIENT
      res.set({ 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Max-Age': 600, 'X-Powered-By': 'Infrapedia.com' });
      res.status(409).json({ t: 'error', data: answ });
    },
  };
  //
  router.get(`${process.env._ROUTE}/`, controllers.infrapedia.ping);
  const mapStatistics = require('../lib/middleware/mapStatistics');
  router.get('/mps', mapStatistics, (req, res) => res.status(200).send('1'));
  // USER
  require('./bymodules/users').callEndPoints(router, controllers, response);
  // ORGANIZATIONS ---------------->
  require('./bymodules/organizations').callEndPoints(router, controllers, response);
  // NETWORKS ---------------->
  require('./bymodules/networks').callEndPoints(router, controllers, response);
  // CLS ---------------->
  require('./bymodules/cls').callEndPoints(router, controllers, response);
  // CABLES ---------------->
  require('./bymodules/cables').callEndPoints(router, controllers, response);
  // FACILITIES --->
  require('./bymodules/facilities').callEndPoints(router, controllers, response);
  // IXPS
  require('./bymodules/ixps').callEndPoints(router, controllers, response);
  // KMZ to GEOJSON
  require('./bymodules/kzmtogeojson').callEndPoints(router, controllers, response);
  // ALERTS ---------------->
  require('./bymodules/alerts').callEndPoints(router, controllers, response);
  // Issuees ---------------->
  require('./bymodules/issues').callEndPoints(router, controllers, response);
  // Message ---------------->
  require('./bymodules/messages').callEndPoints(router, controllers, response);
  // Search ----------------->
  require('./bymodules/search').callEndPoints(router, controllers, response);
  // UPLOADS ---------------->
  require('./bymodules/uploads').callEndPoints(router, controllers, response);
  // SHORTENER ---->
  require('./bymodules/shortener').callEndPoints(router, controllers, response);
  // Map ---->
  require('./bymodules/maps').callEndPoints(router, controllers, response);
  // Tags --->
  require('./bymodules/tags').callEndPoints(router, controllers, response);
  // Master File --->
  require('./bymodules/masterFile').callEndPoints(router, controllers, response);
  // Cluster File --->
  require('./bymodules/cluster').callEndPoints(router, controllers, response);
  // Transfer File --->
  require('./bymodules/transfer').callEndPoints(router, controllers, response);

  // WMS ---> SERVICE
  // const params = { mbtiles: ['./temp/terrestrial.mbtiles', './temp/subsea.mbtiles', './temp/cls.mbtiles', './temp/ixps.mbtiles', './temp/facilities.mbtiles'], quiet: false };
  // require('./bymodules/wms').serve(router, response, params);
  // router.get(`${process.env._ROUTE}/wms/ixps`, (req, res) => { res.sendFile('./temp/ixps.json'); });
  // router.get(`${process.env._ROUTE}/wms/cls`, (req, res) => { res.sendFile('./temp/cls.json'); });
  // router.get(`${process.env._ROUTE}/wms/facilities`, (req, res) => { res.sendFile('./temp/facilities.json'); });
  router.get(`${process.env._ROUTE}/s/:route`, (req, res) => {
    const shortener = require('../models/shorts.model');
    shortener().then((s) => {
      s.findOneAndUpdate({ urlCode: req.params.route },
        { $inc: { views: 1 } }, (err, r) => {
          if (!r.value.original_url) res.redirect(process.env._BASEURL);
          res.render('shortener', { url: r.value.original_url });
        });
    });
  });
  router.get(`${process.env._ROUTE}/webhook/edgeuno`, (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
  });
};
module.exports = routes;
