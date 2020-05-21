module.exports = {
  callEndPoints: (router, controllers, response) => {
    router.post(`${process.env._ROUTE}/contact`, (req, res) => {
      controllers.contact(req.body.email, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/newsletter`, (req, res) => {
      controllers.newsletter(req.body.email, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
