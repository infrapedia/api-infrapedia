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
    info: { title: 'Infrapedia API ', version: '1.0.0', description: 'This is the oficial API of Infrapedia.com' }, basePath: '/',
  };
  const options = { swaggerDefinition, apis: ['./routes/*.js'] };
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
      res.status(200).json(answ);
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
      res.status(200).json(answ);
    },
  };


  //
  /**
   * @swagger
   * /:
   *   get:
   *     tags:
   *       - System
   *     description: Check status of API
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.get('/', controllers.infrapedia.ping);

  /**
   * @swagger
   * /public/:
   *   get:
   *     tags:
   *       - Public
   *     description: Check status of API
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */


  /**
   * @swagger
   * /user/login/linkedin:
   *   get:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.get('/user/login/linkedin',
    passport.authenticate('auth0', { scope: 'openid email profile metadata', connection: 'linkedin' }), (req, res) => {
      res.redirect('/user/login/callback');
    });
  /**
   * @swagger
   * /user/login/callback:
   *   get:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
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
  /**
   * @swagger
   * /user/logout:
   *   post:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.post('/user/logout', (req, res) => {
    req.logout();
    let returnTo = `${req.protocol}://${req.hostname}`;
    const port = req.connection.localPort;
    if (port !== undefined && port !== 80 && port !== 443) { returnTo += `:${port}`; }
    const logoutURL = new url.URL(util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN));
    const searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo,
    });
    logoutURL.search = searchString;
    res.json({ login: 'logout' });
  });
  /**
   * @swagger
   * /user/login/check:
   *   post:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.post('/user/login/check', (req, res) => {
    res.status(200).json({ login: 'ok' });
  });
  /**
   * @swagger
   * /user/profile:
   *   get:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.get('/user/profile', (req, res) => {
    controllers.users.getProfile(req.user.accessToken, req.user.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  /**
   * @swagger
   * /user/profile/update/metadata:
   *   patch:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: companyname
   *        description: name of the company where the person works
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.patch('/user/profile/update/metadata', (req, res) => {
    controllers.users.updateProfileMetaData(req.user.accessToken, req.user.id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  /**
   * @swagger
   * /user/profile/update/phone_number:
   *   patch:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: phone_number
   *        description: Contact number
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.patch('/user/profile/update/phone_number', (req, res) => {
    controllers.users.phoneNumber(req.user.accessToken, req.user.id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  /**
   * @swagger
   * /user/profile/update/name:
   *   patch:
   *     tags:
   *       - Users
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.patch('/user/profile/update/name', (req, res) => {
    controllers.users.updateName(req.user.accessToken, req.user.id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });


  /** *********************** ORGANIZATIONS ************************ */
  /**
   * @swagger
   * /auth/organizations/add:
   *   post:
   *     tags:
   *       - Organizations
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: address
   *      - in: formData
   *        name: premium
   *      - in: formData
   *        name: non_peering
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.post('/auth/organization/add', (req, res) => {
    controllers.organizations.list(req.user.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  /**
   * @swagger
   * /auth/organizations/edit/:id:
   *   patch:
   *     tags:
   *       - Organizations
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/organizations/view/:id:
   *   get:
   *     tags:
   *       - Organizations
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/organizations/all:
   *   get:
   *     tags:
   *       - Organizations
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
  router.get('/auth/organizations/all', (req, res) => {
    controllers.organizations.list(req.user.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  /**
   * @swagger
   * /auth/organizations/delete:
   *   delete:
   *     tags:
   *       - Organizations
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */


  /** ** */

  /**
   * @swagger
   * /auth/networks/add:
   *   post:
   *     tags:
   *       - Networks
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: address
   *      - in: formData
   *        name: premium
   *      - in: formData
   *        name: non_peering
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/networks/edit/:id:
   *   patch:
   *     tags:
   *       - Networks
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/networks/view/:id:
   *   get:
   *     tags:
   *       - Networks
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/networks/all:
   *   get:
   *     tags:
   *       - Networks
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/networks/delete:
   *   delete:
   *     tags:
   *       - Networks
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /** ** */
  /**
   * @swagger
   * /auth/ixps/add:
   *   post:
   *     tags:
   *       - IXPs
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: address
   *      - in: formData
   *        name: premium
   *      - in: formData
   *        name: non_peering
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/ixps/edit/:id:
   *   patch:
   *     tags:
   *       - IXPs
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/ixps/view/:id:
   *   get:
   *     tags:
   *       - IXPs
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/ixps/all:
   *   get:
   *     tags:
   *       - IXPs
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/ixps/delete:
   *   delete:
   *     tags:
   *       - IXPs
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/cls/add:
   *   post:
   *     tags:
   *       - CLS
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: address
   *      - in: formData
   *        name: premium
   *      - in: formData
   *        name: non_peering
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/cls/edit/:id:
   *   patch:
   *     tags:
   *       - CLS
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/cls/view/:id:
   *   get:
   *     tags:
   *       - CLS
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/cls/all:
   *   get:
   *     tags:
   *       - CLS
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/cls/delete:
   *   delete:
   *     tags:
   *       - CLS
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/facilities/add:
   *   post:
   *     tags:
   *       - Facilities
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: notes
   *      - in: formData
   *        name: address
   *      - in: formData
   *        name: premium
   *      - in: formData
   *        name: non_peering
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/facilities/edit/:id:
   *   patch:
   *     tags:
   *       - Facilities
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/facilities/view/:id:
   *   get:
   *     tags:
   *       - Facilities
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/facilities/all:
   *   get:
   *     tags:
   *       - Facilities
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */

  /**
   * @swagger
   * /auth/facilities/delete:
   *   delete:
   *     tags:
   *       - Facilities
   *     description: Login
   *     produces:
   *      - application/json
   *     consumes:
   *      - application/x-www-form-urlencoded
   *     parameters:
   *      - in: formData
   *        name: name
   *        description: FirstName
   *      - in: formData
   *        name: family_name
   *        description: LastName
   *     responses:
   *       200:
   *         description: Check status of API
   *         schema:
   *           type: array
   */
};
module.exports = routes;
