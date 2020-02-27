let Cluster = require('./class/Cluster');

Cluster = new Cluster();
module.exports = {
  network: (usr, id) => Cluster.network(id),
  organization: (usr, id) => Cluster.organization(id),
};
