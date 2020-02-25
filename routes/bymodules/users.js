module.exports = {
  callEndPoints: (router, controllers, response) => {
    router.get(`${process.env._ROUTE}/auth/user/logs`, (req, res) => {
      controllers.users.logs(req.headers.userid)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/user/verifyElemnt`, (req, res) => {
      controllers.users.verifyElement(req.headers.userid, req.body.email, req.body.elemnt, req.body.type)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
