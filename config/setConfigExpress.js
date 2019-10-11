//Declare
const _settings = require('./settings')
const express = require( 'express' )
const session = require('express-session')
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');


//swagger
const swaggerUi = require('swagger-ui-express')
var options = {
  explorer: true,
  customCssUrl: '/assets/css/swagger.css',
  swaggerOptions: {
    url: '/api-docs.json'
  }
}
//Session confg
var redis = require( 'redis' );
var redisStore = require( 'connect-redis' )( session );
var redisClient = redis.createClient(
  {
    // url: settings.redis.domain,
    // tls: { ca: fs.readFileSync(__dirname + "/ssl/redisIBM.pem") }
    // host: settings.redis.domain,
    // port: settings.redis.port
  } ); //tls: { ca: fs.readFileSync(__dirname + "/ssl/redisIBM.pem") }

//SESSION


// Configure Passport to use Auth0
var strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // console.log( extraParams );
    // console.log( profile );
    profile.accessToken = extraParams.id_token;
    // console.log( extraParams );
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);


var expressConfig = function (app) {
  //config
  app.set('settings', _settings)

  //session config
  app.use( session( {
    secret: process.env._JWT_SECRET,
    store: new redisStore(
      { prefix:'INFSSID:',
        pass: _settings.redis.passw,
        client: redisClient,
        ttl :  432000000
      }
    ),
    resave: false,
    saveUninitialized: true,
    name: 'INFCC:',
    cookie: {
      httpOnly: true,
      maxAge: 432000000,
      secure: false
    }
  } ) );

  //use
  passport.use(strategy);
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, options))
  app.use('/assets/css/', express.static(process.cwd() + '/public/css'))
}
module.exports = expressConfig