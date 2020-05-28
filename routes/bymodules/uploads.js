module.exports = {
  callEndPoints: (router, controllers, response) => {
    router.post(`${process.env._ROUTE}/auth/upload/logo`, (req, res) => {
      controllers.uploads.logo(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/upload/kmz`, (req, res) => {
      controllers.uploads.kmz(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/elements/foredit`, (req, res) => {
      const token = req.headers.authorization;
      controllers.editElements.uploadInformation(req.headers.userid, req.body, token)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/upload/kml`, (req, res) => {
      controllers.uploads.kml(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/upload/file`, (req, res) => {
      const allowedExtensionsKmz = /(\.kmz|\.KMZ)$/i;
      const allowedExtensionsKml = /(\.kml|\.KML)$/i;
      if (allowedExtensionsKmz.exec(req.body.file.path)) {
        controllers.uploads.kmz(req.headers.userid, req.body)
          .then((r) => { response.success(res, r); })
          .catch((e) => { response.err(res, e); });
      } else if (allowedExtensionsKml.exec(req.body.file.path)) {
        controllers.uploads.kml(req.headers.userid, req.body)
          .then((r) => { response.success(res, r); })
          .catch((e) => { response.err(res, e); });
      } else {
        response.err(res, { m: 'error', r: [] });
      }
    });
  },
};
