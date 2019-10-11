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
    controllers.users.hello( req.user.name ).then( ( r ) => {
      res.send( r );
    } );
  })
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
    controllers.users.hello( req.user.name ).then( ( r ) => {
      res.send( r );
    } );
  })


};
module.exports = routes