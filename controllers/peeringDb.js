let PeeringDb = require('./class/PeeringDb');

PeeringDb = new PeeringDb();
module.exports = {
  getIxpConnections: () => PeeringDb.getIxpConnections(),
  getFacilitiesInformation: () => PeeringDb.getFacilitiesInformation(),
};
