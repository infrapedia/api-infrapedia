const { redisClient } = require('../config/redis');

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
    err: (res, answ, n) => {
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
      res.status(409).json({ t: 'error', data: answ, n });
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
  // CLS ---------------->
  require('./bymodules/cloud').callEndPoints(router, controllers, response);
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
  // Contact --->
  require('./bymodules/contact').callEndPoints(router, controllers, response);
  // Voting --->
  require('./bymodules/voting').callEndPoints(router, controllers, response);
  // MarketPlace
  require('./bymodules/marketplace').callEndPoints(router, controllers, response);
  // PeeringDb
  require('./bymodules/peeringDb').callEndPoints(router, controllers, response);
  //API SERVICE
  // require('./bymodules/apiService').callEndPoints(router, controllers, response);


  // WMS ---> SERVICE
  const params = { mbtiles: ['./temp/cables.mbtiles', './temp/ixps.mbtiles', './temp/cls.mbtiles', './temp/facilities.mbtiles', './temp/subsea.mbtiles', './temp/terrestrial.mbtiles', './temp/facilitiesp.mbtiles'], quiet: false, do: process.env.wms };
  require('./bymodules/wms').serve(router, response, params);
  require('./bymodules/apiService_WMS').serve(router, response, params);
  // router.get(`${process.env._ROUTE}/wms/ixps`, (req, res) => { res.sendFile(`${process.cwd()}/temp/ixps.json`); });
  // router.get(`${process.env._ROUTE}/wms/cls`, (req, res) => { res.sendFile(`${process.cwd()}/temp/cls.json`); });
  // router.get(`${process.env._ROUTE}/wms/facilities`, (req, res) => { res.sendFile(`${process.cwd()}/temp/facilities.json`); });

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
  // router.get(`${process.env._ROUTE}/createbbox`, (req, res) => {
  //   //controllers.BBOXS.cls(), controllers.BBOXS.ixps()
  //   Promise.all([controllers.BBOXS.cls(), controllers.BBOXS.ixps()]).then(() => {
  //     res.sendStatus(200);
  //   }).catch(() => res.sendStatus(500));
  // });
  router.get(`${process.env._ROUTE}/createbboxcls`, (req, res) => {
    //controllers.BBOXS.cls(), controllers.BBOXS.ixps()
    redisClient.keys('cls_*', async (err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('cls_*', key));
      }
      controllers.BBOXS.cls().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  router.get(`${process.env._ROUTE}/createbboxixp`, (req, res) => {
    //controllers.BBOXS.cls(), controllers.BBOXS.ixps()
    redisClient.keys('ixp_*', async (err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('ixp_*', key));
      }
      controllers.BBOXS.ixps().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  router.get(`${process.env._ROUTE}/createbboxcables`, (req, res) => {
    // //controllers.BBOXS.cls(), controllers.BBOXS.ixps()
    // controllers.BBOXS.cables().then(() => {
    //   res.sendStatus(200);
    // }).catch(() => res.sendStatus(500));
    redisClient.keys('cable_*', async (err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('cable_*', key));
      }
      controllers.BBOXS.cables().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  router.get(`${process.env._ROUTE}/createbboxfacilities`, (req, res) => {
    redisClient.keys('facility_*', async (err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('facility_*', key));
      }
      controllers.BBOXS.facilities().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  // router.get(`${process.env._ROUTE}/createdata`, (req, res) => {
  //   Promise.all([controllers.BBOXS.dataCLS(), controllers.BBOXS.dataIXPS()])
  //     .then(() => {
  //       res.sendStatus(200);
  //     }).catch(() => res.sendStatus(500));
  // });
  router.get(`${process.env._ROUTE}/createdataixps`, (req, res) => {
    redisClient.keys('v_ixp_*', async (err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('v_ixp_*', key));
      }
      controllers.BBOXS.dataIXPS().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  router.get(`${process.env._ROUTE}/createdatacls`, (req, res) => {
    redisClient.keys('v_cls_*', async (err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('v_cls_*', key));
      }
      controllers.BBOXS.dataCLS().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  router.get(`${process.env._ROUTE}/createdatafacilities`, (req, res) => {
    redisClient.keys('v_facility_*', async (err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('v_facility_*', key));
      }
      controllers.BBOXS.dataFacilities().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  router.get(`${process.env._ROUTE}/createdatacables`, (req, res) => {
    redisClient.keys('v_cable_*', async(err, keys) => {
      if (Array.isArray(keys)) {
        await keys.map((key) => redisClient.del('v_cable_*', key));
      }
      controllers.BBOXS.dataCables().then(() => {
        res.sendStatus(200);
      }).catch(() => res.sendStatus(500));
    });
  });
  router.get(`${process.env._ROUTE}/createSlugs`, (req, res) => {
    controllers.SEO.createSlugs().then((r) => res.sendStatus(200)).catch((res.sendStatus(500)));
  });
  router.get(`${process.env._ROUTE}/createSiteMap`, (req, res) => {
    controllers.SEO.createSitemap().then((r) => res.sendStatus(200)).catch((res.sendStatus(500)));
  });
  router.get('/debug-sentry', (req, res) => {
    throw new Error('My first Sentry error!');
  });
  router.get(`${process.env._ROUTE}/idslug/:type/:slug`, (req, res) => {
    switch (req.params.type) {
      case 'cable':
        controllers.cables.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'terrestrial-network':
        controllers.cables.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'subsea-cable':
        controllers.cables.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'cls':
        controllers.cableLandingStations.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'ixp':
        controllers.InternetExchangePoints.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'ixps':
        controllers.InternetExchangePoints.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'facility':
        controllers.facilities.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'facilities':
        controllers.facilities.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'network':
        controllers.networks.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'group':
        controllers.networks.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      case 'organization':
        controllers.organizations.getIdBySlug(req.params.slug)
          .then((r) => { response.success(res, r, false); })
          .catch((e) => { response.err(res, e); });
        break;
      default:
        res.sendStatus(500);
        break;
    }
  });
};
module.exports = routes;
