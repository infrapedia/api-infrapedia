// declare
const swaggerJSDoc = require('swagger-jsdoc');
const passport = require('passport');
const util = require('util');
const url = require('url');
const querystring = require('querystring');
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
      res.status(409).json({ t: 'success', data: answ });
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
  router.post('/auth/organization/edit', (req, res) => {
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
  // NETWORKS ---------------->
};
module.exports = routes;
