const pool = require('../config/pgSQL.js');
const redisClient = require('../config/redis');

let Facility = require('./class/Facility');

Facility = new Facility();
module.exports = {
  search: (usr, query) => Facility.search(usr, query),
  transferFacilities: () => new Promise((resolve, reject) => {
    const SQLQuery = `SELECT 
fac_id, org_id, address1, address2, city, clli, country, created, latitude, longitude, name, net_count, notes, npanxx, rencode, state, status, updated, website, zipcode, org_name, osm_addr_city, osm_addr_country, osm_addr_housenumber, osm_addr_postcode, osm_addr_state, osm_addr_street, osm_building, osm_building_levels, osm_height, osm_id, osm_name, osm_operator, osm_source, osm_start_date, osm_telecom,premium, 
ST_AsGeoJSON(point) as point
,json_build_object(
            'type',       'Feature',
            'geometry',   ST_AsGeoJSON(polygon)::json,
            'properties', json_build_object(
                'height', osm_height
            )
        ) AS polygon
FROM facility`;
    pool.query(SQLQuery, async (error, results) => {
      if (error) { throw error; }
      Promise.all(results.rows.map((f) => Facility.addByTransfer(f))).then((r) => {
        resolve({ m: 'The transfer was finished' });
      }).catch((e) => {
        reject({ m: 'The transfer was finished', r: e });
      });
    });
  }),
  owner: (usr, id) => Facility.owner(usr, id),
  view: (usr, id) => Facility.view(usr, id),
  clusterIxpConnection: (id) => Facility.clusterIxpConnection(id),
  bbox: (user, id) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`facility_${id}`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  getElementGeom: (usr, id) => Facility.getElementGeom(id),
  getMultiElementsGeom: (usr, ids) => Facility.getMultiElementsGeom(ids),
  getMultiElementsGeomPoints: (usr, ids) => Facility.getMultiElementsGeomPoints(ids),
  add: (usr, data) => Facility.add(usr, data),
  edit: (usr, data) => Facility.edit(usr, data),
  list: (usr, page) => Facility.list(usr, page),
  delete: (usr, id) => Facility.delete(usr, id),
  checkName: (name) => Facility.checkName(name),
  checkPeeringDb: (fac_id) => Facility.checkPeeringDb(fac_id),
  permanentDelete: (usr, id, code) => Facility.permanentDelete(usr, id, code),
  clustering: () => Facility.clustering(),
  getIdBySlug: (slug) => Facility.getIdBySlug(slug),
  getNamesByList: (slug) => Facility.getNamesByList(slug),
  centroid: () => Facility.centroid(),
  checkElements: (res) => Facility.checkElements(res),
};
