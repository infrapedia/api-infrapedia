
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
  router.get('/', controllers.infrapedia.ping);
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

};
module.exports = routes;
