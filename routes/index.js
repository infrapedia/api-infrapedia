//declare
const swaggerJSDoc = require( 'swagger-jsdoc' );
const passport = require('passport');
const util = require('util');
const url = require('url');
const querystring = require('querystring');
const secureMiddleware = require('./middleware/secure')();

var routes = function( router, controllers ){

  //Swagger conf
  var swaggerDefinition = {
    info: { title: 'Infrapedia API ', version: '1.0.0', description: 'This is the oficial API of Infrapedia.com' }, basePath: '/'
  };
  var options = { swaggerDefinition: swaggerDefinition, apis: [ './routes/*.js' ] };
  const swaggerSpec = swaggerJSDoc(options);
  router.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });


  //Response information

  let response = {
    success: ( res, answ ) => {
      res.set( { 'Content-Type': 'application/json; charset=utf-8',  'Access-Control-Max-Age': 600, 'X-Powered-By': 'Agrimanager.app', 'X-Auth-Token': ( answ.session ) ? answ.session : 'Agrimanager'  } );
      res.status( 200 ).json( answ );
    },
    err: ( req, res, answ ) => {
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
      //REPORT CLIENT
      console.log( answ );
      res.set( { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Max-Age': 600, 'X-Powered-By': 'Agrimanager.app' } );
      res.status( 200 ).json( answ );
    },
  }


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
  router.get('/', controllers.infrapedia.ping )
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
  router.get(
    '/user/login/linkedin',
    passport.authenticate('auth0', { scope: 'openid email profile metadata',  connection: 'linkedin' }), function (req, res) {
      res.redirect('/user/login/callback')
    })
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
  router.get('/user/login/callback', function (req, res, next) {
    passport.authenticate('auth0', function (err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.status( 401 ).json({ login: "failed" } ) } //res.redirect('/login');
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        const returnTo = req.session.returnTo;
        delete req.session.returnTo;
        res.status( 200 ).json({ login: "success", usr: req.user } )
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
    let returnTo = req.protocol + '://' + req.hostname;
    let port = req.connection.localPort;
    if (port !== undefined && port !== 80 && port !== 443) { returnTo += ':' + port; }
    var logoutURL = new url.URL( util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN) )
    var searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
    });
    logoutURL.search = searchString;
    res.json({ login: "logout" } )
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
  router.post('/user/login/check', secureMiddleware, (req, res) => {
    res.status( 200 ).json({ login: "ok" } )
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
    controllers.users.getProfile( req.user.accessToken, req.user.id ).then( ( r ) => {  response.success( res, r ) } )
      .catch( ( e ) => {  response.err( e ); });
  })
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
    controllers.users.updateProfileMetaData( req.user.accessToken, req.user.id, req.body ).then( ( r ) => {  response.success( res, r ) } )
      .catch( ( e ) => {  response.err( e ); });
  })
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
    controllers.users.phoneNumber( req.user.accessToken, req.user.id, req.body ).then( ( r ) => {  response.success( res, r ) } )
      .catch( ( e ) => {  response.err( e ); });
  })
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
    controllers.users.updateName( req.user.accessToken, req.user.id, req.body ).then( ( r ) => {  response.success( res, r ) } )
      .catch( ( e ) => {  response.err( e ); });
  })

  /**
   * @swagger
   * /organization/add:
   *   post:
   *     tags:
   *       - Organization
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
   * /organization/edit/:id:
   *   patch:
   *     tags:
   *       - Organization
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
   * /organization/view/:id:
   *   get:
   *     tags:
   *       - Organization
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
   * /organization/all:
   *   get:
   *     tags:
   *       - Organization
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
module.exports = routes