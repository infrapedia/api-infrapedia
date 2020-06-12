module.exports = {
  callEndPoints: (router, controllers, response) => {
    router.post(`${process.env._ROUTE}/auth/vote`, (req, res) => {
      controllers.voting.setVote(req.body, req.headers.userid)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/vote`, (req, res) => {
      controllers.voting.getVote(req.headers.userid)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e, false); });
    });
    router.get(`${process.env._ROUTE}/votes`, (req, res) => {
      controllers.voting.results()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e, false); });
    });
  },
};
