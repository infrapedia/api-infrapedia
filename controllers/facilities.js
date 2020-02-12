const pool = require('../config/pgSQL.js');
let Facility = require('./class/Facility');

Facility = new Facility();
module.exports = {
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
      Promise.all(results.rows.map((f) => Facility.addByTransfer('', f))).then((r) => {
        resolve({ m: 'The transfer was finished' });
      }).catch((e) => {
        resolve({ m: 'The transfer was finished', r: e });
      });
    });
  }),
};
