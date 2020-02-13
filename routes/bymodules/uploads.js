module.exports = {
  callEndPoints: (router, controllers, response ) => {
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
  },
};
