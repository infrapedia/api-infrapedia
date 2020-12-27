let PeeringDb = require('./class/PeeringDb');

PeeringDb = new PeeringDb();
module.exports = {
  getIxpConnections: () => PeeringDb.getIxpConnections(),
  getFacilitiesInformation: () => PeeringDb.getFacilitiesInformation(),
  getFacilitiesInformationById: (id) => PeeringDb.getFacilitiesInformationById(id),
  updateGeoJsonPointFacilities: () => PeeringDb.updateGeoJsonPointFacilities(),
  updateGeoJsonPointIXP: () => PeeringDb.updateGeoJsonPointIXP(),
};
