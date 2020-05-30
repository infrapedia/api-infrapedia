// Declare
// eslint-disable-next-line no-underscore-dangle
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const formData = require('express-form-data');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const compression = require('compression');
const path = require('path');
const Sentry = require('@sentry/node');

Sentry.init({ dsn: `https://${process.env.SENTRY}.ingest.sentry.io/5257355` });
// bugsnag
// const bugsnag = require('@bugsnag/js');
// const bugsnagExpress = require('@bugsnag/plugin-express');
//
// const bugsnagClient = bugsnag('d376cb029ba391af1b92c22f316570a1');
//
// bugsnagClient.use(bugsnagExpress);
// const middleware = bugsnagClient.getPlugin('express');
// swagger
const swaggerUi = require('swagger-ui-express');
const _settings = require('./settings');

const options = {
  explorer: true,
  customCssUrl: '/assets/css/swagger.css',
  swaggerOptions: {
    url: '/api-docs.json',
  },
};

// // Session confg
// const redis = require('redis');
// const redisStore = require('connect-redis')(session);
//
// const redisClient = redis.createClient(
//   {
//     // url: settings.redis.domain,
//     // tls: { ca: fs.readFileSync(__dirname + "/ssl/redisIBM.pem") }
//     // host: settings.redis.domain,
//     // port: settings.redis.port
//   },
// );
// tls: { ca: fs.readFileSync(__dirname + "/ssl/redisIBM.pem") }

// SESSION
// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  ((accessToken, refreshToken, extraParams, profile, done) => {
    // console.log( extraParams );
    // console.log( profile );
    profile.accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik56WTJOVVZCTURNM1JqaEROak0yTkRCQ1JERTNNRGsxUWpnelJVVTBNemd4TnpReE1ERTBNZyJ9.eyJpc3MiOiJodHRwczovL2luZnJhcGVkaWEuYXV0aDAuY29tLyIsInN1YiI6ImJVYU9oSDNpR0h5M2RRQWxDc1ZCV085TEhEM25xTlkzQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2luZnJhcGVkaWEuYXV0aDAuY29tL2FwaS92Mi8iLCJpYXQiOjE1NzExNTQ5NzIsImV4cCI6MTU3MTI0MTM3MiwiYXpwIjoiYlVhT2hIM2lHSHkzZFFBbENzVkJXTzlMSEQzbnFOWTMiLCJzY29wZSI6InJlYWQ6Y2xpZW50X2dyYW50cyBjcmVhdGU6Y2xpZW50X2dyYW50cyBkZWxldGU6Y2xpZW50X2dyYW50cyB1cGRhdGU6Y2xpZW50X2dyYW50cyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGNyZWF0ZTp1c2VyX3RpY2tldHMgcmVhZDpjbGllbnRzIHVwZGF0ZTpjbGllbnRzIGRlbGV0ZTpjbGllbnRzIGNyZWF0ZTpjbGllbnRzIHJlYWQ6Y2xpZW50X2tleXMgdXBkYXRlOmNsaWVudF9rZXlzIGRlbGV0ZTpjbGllbnRfa2V5cyBjcmVhdGU6Y2xpZW50X2tleXMgcmVhZDpjb25uZWN0aW9ucyB1cGRhdGU6Y29ubmVjdGlvbnMgZGVsZXRlOmNvbm5lY3Rpb25zIGNyZWF0ZTpjb25uZWN0aW9ucyByZWFkOnJlc291cmNlX3NlcnZlcnMgdXBkYXRlOnJlc291cmNlX3NlcnZlcnMgZGVsZXRlOnJlc291cmNlX3NlcnZlcnMgY3JlYXRlOnJlc291cmNlX3NlcnZlcnMgcmVhZDpkZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmRldmljZV9jcmVkZW50aWFscyBkZWxldGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGNyZWF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgcmVhZDpydWxlcyB1cGRhdGU6cnVsZXMgZGVsZXRlOnJ1bGVzIGNyZWF0ZTpydWxlcyByZWFkOnJ1bGVzX2NvbmZpZ3MgdXBkYXRlOnJ1bGVzX2NvbmZpZ3MgZGVsZXRlOnJ1bGVzX2NvbmZpZ3MgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDp0ZW5hbnRfc2V0dGluZ3MgdXBkYXRlOnRlbmFudF9zZXR0aW5ncyByZWFkOmxvZ3MgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHJlYWQ6YW5vbWFseV9ibG9ja3MgZGVsZXRlOmFub21hbHlfYmxvY2tzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMgY3JlYXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgZGVsZXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgcmVhZDpjdXN0b21fZG9tYWlucyBkZWxldGU6Y3VzdG9tX2RvbWFpbnMgY3JlYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIn0.YK3VOBrAIo-bbY8aXH8NCU4lJ1oKvw6kSa0gEncam8KomhI8t7EbWC2z3OJnfEqSxkrsK7Pvpdd4WHgjVUCzvc2PGl23OF0-Wok8r5YfKC5875GKobutWwUE5UP5wCE7lBIP31nbkyfVu_g-FUUq13jtkvraAqyr0mQO7wnFEINSoqE0eE6b0BP5aRYdxa_h7q9WF4tpYWzxX039_HuB6M5SS_iNoDBsRbYSKS3dh8WwP-odeOERvPLB8uMG-NBBm1ueAOu-X6EkL85s9jQxVqAbB5bCRofKAfaZMp1TElA2SDLdA8GZdPuicfTwsIRbY6iC10qtZeYSER0KSsWybA'; // extraParams.id_token;
    // console.log( extraParams );
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }),
);


const expressConfig = function (app) {
  // Bugsnag
  // This must be the first piece of middleware in the stack.
  // It can only capture errors in downstream middleware
  // app.use(middleware.requestHandler);
  /* all other middleware and application routes go here */
  // This handles any errors that Express catches
  // app.use(middleware.errorHandler);
  // config
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
  app.set('settings', _settings);
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', _settings.urlCors);
    // res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Length, X-Requested-With, Content-Type, Accept, userid');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, PATCH, OPTIONS'); // ALLOW
    res.header('Access-Control-Max-Age', 600);
    next();
  });
  app.use(compression());
  app.set('views', path.join(process.cwd(), 'templates/email'));
  app.set('view engine', 'ejs');

  // session config
  /*
  {
    secret: process.env._JWT_SECRET,
    // eslint-disable-next-line new-cap
    store: new redisStore(
      {
        prefix: 'INFSSID:',
        pass: _settings.redis.passw,
        client: redisClient,
        ttl: 432000000,
      },
    ),
    resave: false,
    saveUninitialized: true,
    name: 'INFCC:',
    cookie: {
      httpOnly: true,
      maxAge: 432000000,
      secure: false,
    },
  }
   */
  app.use(session({
    secret: 'infrapedia',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }));

  // use
  passport.use(strategy);
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, options));
  app.use('/assets/css/', express.static(`${process.cwd()}/public/css`));

  // data parser
  app.use(bodyParser.json({ limit: '50mb', extended: true }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
  app.use(formData.parse(options));
  app.use(formData.format());
  app.use(formData.stream());
  app.use(formData.union());
  app.use('/auth', (err, req, res, next) => {
    next();
  });
  app.use((err, req, res, next) => {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(`${res.sentry}\n`);
  });
};
module.exports = expressConfig;
