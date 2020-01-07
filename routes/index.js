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
    success: (res, answ) => {
      res.set(
        {
          'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Max-Age': 600, 'X-Powered-By': 'Infrapedia.com', 'X-Auth-Token': (answ.session) ? answ.session : 'Infrapedia',
        },
      );
      res.status(200).json({ t: 'success', data: answ });
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
  router.get('/user/login',
    passport.authenticate('auth0', { scope: 'openid email profile metadata' }), (req, res) => {
      res.redirect('/user/login/callback');
    });
  router.get('/user/login/linkedin',
    passport.authenticate('auth0', { scope: 'openid email profile metadata', connection: 'linkedin' }), (req, res) => {
      res.redirect('/user/login/callback');
    });
  router.get('/user/login/callback', (req, res, next) => {
    passport.authenticate('auth0', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { return res.status(401).json({ login: 'failed' }); } // res.redirect('/login');
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        const { returnTo } = req.session;
        delete req.session.returnTo;
        res.status(200).json({ login: 'success', usr: req.user });
      });
    })(req, res, next);
  });
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
  router.post('/auth/organization/add', (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.organizations.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put('/auth/organization/edit', (req, res) => {
    controllers.organizations.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/organization/all', (req, res) => {
    controllers.organizations.list(req.headers.user_id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.delete('/auth/organization/delete/:id', (req, res) => {
    controllers.organizations.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/organization/owner/:id', (req, res) => {
    controllers.organizations.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  // NETWORKS ---------------->
  router.post('/auth/network/add', (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.networks.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put('/auth/network/edit', (req, res) => {
    controllers.networks.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/network/all', (req, res) => {
    controllers.networks.list(req.headers.user_id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  router.delete('/auth/network/delete/:id', (req, res) => {
    controllers.networks.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/network/owner/:id', (req, res) => {
    controllers.networks.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  // CLS ---------------->
  router.post('/auth/cls/add', (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.cableLandingStations.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put('/auth/cls/edit', (req, res) => {
    controllers.cableLandingStations.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/cls/all', (req, res) => {
    controllers.cableLandingStations.list(req.headers.user_id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  router.delete('/auth/cls/delete/:id', (req, res) => {
    controllers.cableLandingStations.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  router.get('/auth/cls/owner/:id', (req, res) => {
    controllers.cableLandingStations.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  // CABLES ---------------->
  router.post('/auth/cables/add', (req, res) => {
    controllers.cables.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.put('/auth/cables/edit', (req, res) => {
    controllers.cables.edit(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/cables/all', (req, res) => {
    controllers.cables.list(req.headers.user_id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.delete('/auth/cables/delete/:id', (req, res) => {
    controllers.cables.delete(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/cables/owner/:id', (req, res) => {
    controllers.cables.owner(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  // KMZ to GEOJSON
  router.post('/auth/kmz/togeojson', (req, res) => {
    controllers.convert.kmzToGeojson(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  // ALERTS ---------------->
  router.post('/auth/alerts/add', (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.alerts.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.patch('/auth/alerts/disabled', (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.alerts.disabled(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  // Issuees ---------------->
  router.post('/auth/issues/report', (req, res) => {
    // console.log(req.body)
    controllers.issues.addReport(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/issues/reports', (req, res) => {
    controllers.issues.reports(req.headers.user_id, req.query.page)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get('/auth/issues/myreports', (req, res) => {
    controllers.issues.myReports(req.headers.user_id, req.query.page)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  // UPLOADS ---------------->
  router.post('/auth/upload/logo', (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.uploads.logo(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.post('/auth/upload/kmz', (req, res) => {
    // console.log((req.headers.authorization, req.headers.user_id));
    controllers.uploads.kmz(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
};
module.exports = routes;
