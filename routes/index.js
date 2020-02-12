
const routes = function (router, controllers) {
  // Swagger conf
  // const swaggerDefinition = {
  //   info: { title: 'Infrapedia API ', version: '1.0.0', description: 'This is the oficial API of Infrapedia.com' },
  //   basePath: '/',
  // };
  // const options = { swaggerDefinition, apis: ['./routes/docs/*.js'] };
  // const swaggerSpec = swaggerJSDoc(options);
  // router.get('/api-docs.json', (req, res) => {
  //   res.setHeader('Content-Type', 'application/json');
  //   res.send(swaggerSpec);
  // });
  // // Response information --

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
  // ORGANIZATIONS ---------------->
  require('./bymodules/organizations').callEndPoints(router, controllers, response);
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
  router.get(`${process.env._ROUTE}/auth/facilities/search`, (req, res) => {
    controllers.facilities.search(req.headers.user_id, req.query.s)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  // IXPS
  router.get(`${process.env._ROUTE}/ixps/transfer`, (req, res) => {
    controllers.InternetExchangePoints.transferIXPS()
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/ixps/search`, (req, res) => {
    controllers.InternetExchangePoints.search(req.headers.user_id, req.query.s)
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
    controllers.issues.deleteMyReport(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  // Message ---------------->
  router.post(`${process.env._ROUTE}/auth/message/send`, (req, res) => {
    // console.log(req.body)
    controllers.messages.add(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/messages/sents`, (req, res) => {
    controllers.messages.sents(req.headers.user_id, req.query.page)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/messages/mymessages`, (req, res) => {
    controllers.messages.myMessages(req.headers.user_id, req.query.page)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.get(`${process.env._ROUTE}/auth/message/view/:elemnt/:id`, (req, res) => {
    controllers.messages.viewMessage(req.headers.user_id, req.params.id, req.params.elemnt)
      .then((r) => { response.success(res, r, false); })
      .catch((e) => { response.err(res, e); });
  });
  router.delete(`${process.env._ROUTE}/auth/message/delete/:id`, (req, res) => {
    controllers.messages.deleteMyMessage(req.headers.user_id, req.params.id)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });
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
  router.post(`${process.env._ROUTE}/auth/elements/foredit`, (req, res) => {
    controllers.editElements.uploadInformation(req.headers.user_id, req.body)
      .then((r) => { response.success(res, r); })
      .catch((e) => { response.err(res, e); });
  });

  // SHORTENER ---->
  router.post(`${process.env._ROUTE}/auth/shortener/url`, (req, res) => {
    // first we're going to test if everything is ok with the url
    try {
      const originalUrl = new URL(req.body.url);
      // we need to test if the url exist
      const dns = require('dns');
      dns.lookup(originalUrl.hostname, (err) => {
        if (err) { return res.status(404).send({ m: 'Address not found' }); }
        const { db } = req.app.locals;
        controllers.shortener.createNewUrl(req.headers.user_id, originalUrl.href)
          .then((r) => { response.success(res, r); })
          .catch((e) => { response.err(res, e); });
      });
    } catch (err) { return res.status(400).send({ m: 'invalid URL' }); }
  });
};
module.exports = routes;
