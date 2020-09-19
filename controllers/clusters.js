let Cluster = require('./class/Cluster');
const redisClient = require('../config/redis');

Cluster = new Cluster();
module.exports = {
  getOrganizationCluster: (id) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`v_co_${id}`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  organizationsCluster: () => Cluster.organizationsCluster(),
  getClusterWithoutRedis: (id) => Cluster.createOrganizationCluster(id),
};
