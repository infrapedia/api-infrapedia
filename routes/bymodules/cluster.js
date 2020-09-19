module.exports = {
  callEndPoints: (router, controllers, response) => {
    // router.get(`${process.env._ROUTE}/cluster/network/:id`, (req, res) => {
    //   controllers.clusters.network(req.headers.userid, req.params.id)
    //     .then((r) => { response.success(res, r, false); })
    //     .catch((e) => { response.err(res, e); });
    // });
    router.get(`${process.env._ROUTE}/cluster/organization/:id`, (req, res) => {
      console.log(req.params.id);
      controllers.clusters.getClusterWithoutRedis(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/cluster/organizations`, (req, res) => {
      controllers.clusters.organizationsCluster()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
  },
};
