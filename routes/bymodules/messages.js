module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');
    router.post(`${process.env._ROUTE}/auth/message/send`, (req, res) => {
      // console.log(req.body)
      const token = req.headers.authorization;
      controllers.messages.add(req.headers.userid, req.body, token)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/messages/sents`, (req, res) => {
      controllers.messages.sents(req.headers.userid, req.query.page)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/messages/mymessages`, (req, res) => {
      controllers.messages.myMessages(req.headers.userid, req.query.page)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/message/view/:elemnt/:id`, (req, res) => {
      controllers.messages.viewMessage(req.headers.userid, req.params.id, req.params.elemnt)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/message/delete/:id`, (req, res) => {
      controllers.messages.deleteMyMessage(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/message/makeanoffer`, (req, res) => {
      const token = req.headers.authorization;
      controllers.messages.makeAnOffer(req.headers.userid, token, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
