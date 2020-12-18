let PeeringDb = require('./class/PeeringDb');

PeeringDb = new PeeringDb();
module.exports = {
  getIXPSConnection: (id) => PeeringDb.getIXPSConnection(id),
  getIXPSConnectionByLocation: (location) => PeeringDb.getIXPSConnectionByLocation(location),
  getMyConnection: (orgId) => PeeringDb.getMyConnection(orgId)
};
