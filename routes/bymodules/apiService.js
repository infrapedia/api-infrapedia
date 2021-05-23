module.exports = {
  // callEndPoints: (router, controllers, response) => {
  //   router.post(`${process.env._ROUTE}/auth/apiservice/checkey`, (req, res) => {
  //     controllers.apiService.checkKey(req.headers.userid, req.body.domain)
  //       .then((r) => { response.success(res, r); })
  //       .catch((e) => { response.err(res, e); });
  //   });
  //   const validateKey = require('../../lib/middleware/validateApiKey');
  //   router.get(`${process.env._ROUTE}/apiservice/test/validatekey`, validateKey, (req, res) => {
  //     res.sendStatus(200);
  //   });
  //   router.get(`${process.env._ROUTE}/apiservice/html/validatekey`, (req, res) => {
  //     const ejs = require('ejs');
  //     ejs.renderFile('templates/infrapedia/validateApi.ejs', {
  //       key: process.env.MAPBOX,
  //     }, (err, html) => {
  //       if (err) { res.sendStatus(400); }
  //       res.send(html);
  //     });
  //   });
  // },
};
