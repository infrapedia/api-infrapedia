module.exports = {
  callEndPoints: (router, controllers, response ) => {
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
  },
};
