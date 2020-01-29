// declare
const swaggerJSDoc = require('swagger-jsdoc');
const passport = require('passport');
// const util = require('util');
// const url = require('url');
// const querystring = require('querystring');
// const secureMiddleware = require('../lib/middleware/secure')();
// eslint-disable-next-line func-names
const routes = function (router, controllers) {
  // Swagger conf
  const swaggerDefinition = {
    info: { title: 'Infrapedia API ', version: '1.0.0', description: 'This is the oficial API of Infrapedia.com' },
    basePath: '/',
  };
  const options = { swaggerDefinition, apis: ['./routes/docs/*.js'] };
  const swaggerSpec = swaggerJSDoc(options);
  router.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });


  // Response information

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
  router.get('/', controllers.infrapedia.ping);
  // USERS ---------------->
  // router.get('/user/login',
  //   passport.authenticate('auth0', { scope: 'openid email profile metadata' }), (req, res) => {
  //     res.redirect('/user/login/callback');
  //   });
  // router.get('/user/login/linkedin',
  //   passport.authenticate('auth0', { scope: 'openid email profile metadata', connection: 'linkedin' }), (req, res) => {
  //     res.redirect('/user/login/callback');
  //   });
  // router.get('/user/login/callback', (req, res, next) => {
  //   passport.authenticate('auth0', (err, user, info) => {
  //     if (err) { return next(err); }
  //     if (!user) { return res.status(401).json({ login: 'failed' }); } // res.redirect('/login');
  //     req.logIn(user, (err) => {
  //       if (err) { return next(err); }
  //       const { returnTo } = req.session;
  //       delete req.session.returnTo;
  //       res.status(200).json({ login: 'success', usr: req.user });
  //     });
  //   })(req, res, next);
  // });
  // router.post('/user/logout', (req, res) => {
  //   req.logout();
  //   let returnTo = `${req.protocol}://${req.hostname}`;
  //   const port = req.connection.localPort;
  //   if (port !== undefined && port !== 80 && port !== 443) { returnTo += `:${port}`; }
  //   const logoutURL = new url.URL(util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN));
  //   const searchString = querystring.stringify({
  //     client_id: process.env.AUTH0_CLIENT_ID,
  //     returnTo,
  //   });
  //   logoutURL.search = searchString;
  //   res.json({ login: 'logout' });
  // });
  // router.post('/user/login/check', (req, res) => {
  //   res.status(200).json({ login: 'ok' });
  // });
  // router.get('/user/profile', (req, res) => {
  //   console.log((req.headers.authorization || req.user.accessToken));
  //   controllers.users.getProfile(req.user.accessToken, req.user.id)
  //     .then((r) => { response.success(res, r); })
  //     .catch((e) => { response.err(res, e); });
  // });
  // router.patch('/user/profile/update/metadata', (req, res) => {
  //   controllers.users.updateProfileMetaData(req.user.accessToken, req.user.id, req.body)
  //     .then((r) => { response.success(res, r); })
  //     .catch((e) => { response.err(res, e); });
  // });
  // router.patch('/user/profile/update/phone_number', (req, res) => {
  //   controllers.users.phoneNumber(req.user.accessToken, req.user.id, req.body)
  //     .then((r) => { response.success(res, r); })
  //     .catch((e) => { response.err(res, e); });
  // });
  // router.patch('/user/profile/update/name', (req, res) => {
  //   controllers.users.updateName(req.user.accessToken, req.user.id, req.body)
  //     .then((r) => { response.success(res, r); })
  //     .catch((e) => { response.err(res, e); });
  // });


  // ORGANIZATIONS ---------------->
  router.post(`${process.env._ROUTE}/auth/organization/add`, (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.organizations.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put(`${process.env._ROUTE}/auth/organization/edit`, (req, res) => {
    controllers.organizations.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/organization/all`, (req, res) => {
    controllers.organizations.list(req.headers.user_id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.delete(`${process.env._ROUTE}/auth/organization/delete/:id`, (req, res) => {
    controllers.organizations.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/organization/owner/:id`, (req, res) => {
    controllers.organizations.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/organization/view/:id`, (req, res) => {
    controllers.organizations.view(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/organization/search`, (req, res) => {
    controllers.organizations.search(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  // NETWORKS ---------------->
  router.post(`${process.env._ROUTE}/auth/network/add`, (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.networks.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put(`${process.env._ROUTE}/auth/network/edit`, (req, res) => {
    controllers.networks.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/network/all`, (req, res) => {
    controllers.networks.list(req.headers.user_id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });

  router.delete(`${process.env._ROUTE}/auth/network/delete/:id`, (req, res) => {
    controllers.networks.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/network/owner/:id`, (req, res) => {
    controllers.networks.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });

  router.get(`${process.env._ROUTE}/network/view/:id`, (req, res) => {
    controllers.networks.view(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/network/search`, (req, res) => {
    controllers.networks.search(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  // CLS ---------------->
  router.post(`${process.env._ROUTE}/auth/cls/add`, (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.cableLandingStations.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put(`${process.env._ROUTE}/auth/cls/edit`, (req, res) => {
    controllers.cableLandingStations.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/cls/all`, (req, res) => {
    controllers.cableLandingStations.list(req.headers.user_id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });

  router.delete(`${process.env._ROUTE}/auth/cls/delete/:id`, (req, res) => {
    controllers.cableLandingStations.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  router.get(`${process.env._ROUTE}/auth/cls/owner/:id`, (req, res) => {
    controllers.cableLandingStations.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });

  router.get(`${process.env._ROUTE}/cls/box/:id`, (req, res) => {
    controllers.cableLandingStations.bbox(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/cls/view/:id`, (req, res) => {
    controllers.cableLandingStations.view(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/cls/search`, (req, res) => {
    controllers.cableLandingStations.search(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });

  // CABLES ---------------->
  router.post(`${process.env._ROUTE}/auth/cables/add`, (req, res) => {
    controllers.cables.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put(`${process.env._ROUTE}/auth/cables/edit`, (req, res) => {
    controllers.cables.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/cables/all`, (req, res) => {
    controllers.cables.list(req.headers.user_id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/cables/shortlist`, (req, res) => {
    controllers.cables.shortList(req.headers.user_id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.delete(`${process.env._ROUTE}/auth/cables/delete/:id`, (req, res) => {
    controllers.cables.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/cables/owner/:id`, (req, res) => {
    controllers.cables.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/cables/box/:id`, (req, res) => {
    controllers.cables.bbox(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/cables/view/:id`, (req, res) => {
    controllers.cables.view(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/cables/search`, (req, res) => {
    console.log(req.headers.user_id);
    controllers.cables.search(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });

  // FACILITIES --->
  router.get(`${process.env._ROUTE}/facilities/transfer`, (req, res) => {
    controllers.facilities.transferFacilities()
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  // KMZ to GEOJSON
  router.post(`${process.env._ROUTE}/auth/kmz/lines/togeojson`, (req, res) => {
    controllers.convert.kmzToGeojsonLines(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.post(`${process.env._ROUTE}/auth/kmz/points/togeojson`, (req, res) => {
    controllers.convert.kmzToGeojsonPoints(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  // ALERTS ---------------->
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
      .then((r) => { response.success(res, r); })
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
  // Issuees ---------------->
  router.post(`${process.env._ROUTE}/auth/issues/report`, (req, res) => {
    // console.log(req.body)
    controllers.issues.addReport(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/issues/reports`, (req, res) => {
    controllers.issues.reports(req.headers.user_id, req.query.page)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/issues/myreports`, (req, res) => {
    controllers.issues.myReports(req.headers.user_id, req.query.page)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/issues/view/:elemnt/:id`, (req, res) => {
    controllers.issues.viewReport(req.headers.user_id, req.params.id, req.params.elemnt)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.delete(`${process.env._ROUTE}/auth/issues/delete/:id`, (req, res) => {
    controllers.issues.viewReport(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  // Message ---------------->

  // Search ----------------->
  router.get(`${process.env._ROUTE}/search/field`, (req, res) => {
    controllers.searchs.byField(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/search/field/cables`, (req, res) => {
    controllers.searchs.byFieldCables(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/search/field/cls`, (req, res) => {
    controllers.searchs.byFieldCls(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/search/field/networks`, (req, res) => {
    controllers.searchs.byFieldNetworks(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/search/field/orgs`, (req, res) => {
    controllers.searchs.byFieldOrgs(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  // UPLOADS ---------------->
  router.post(`${process.env._ROUTE}/auth/upload/logo`, (req, res) => {
    controllers.uploads.logo(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.post(`${process.env._ROUTE}/auth/upload/kmz`, (req, res) => {
    controllers.uploads.kmz(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
};
module.exports = routes;
