const pool = require('../config/pgSQL.js');
let Facility = require('./class/Facility');
let Organization = require('./class/Organization');
let IXP = require('./class/InternetExchangePoint');
let CLS = require('./class/CableLandingStation');
let CABLES = require('./class/Cable');

module.exports = {
  organizations: () => new Promise((resolve, reject) => {
    console.log('transfer started');
    Organization = new Organization();
    const SQLQuery = 'SELECT org_id as ooid, name, website as url, notes, address1, address2, city, country, state, zipcode, created, updated, status, non_peering, premium, logo FROM org';
    pool.query(SQLQuery, async (error, results) => {
      if (error) { throw error; }
      Promise.all(results.rows.map((f) => Organization.addByTransfer(f))).then((r) => {
        resolve({ m: 'The transfer was finished' });
      }).catch((e) => {
        reject({ m: 'The transfer was finished', r: e });
      });
    });
  }),
  facilities: () => new Promise((resolve, reject) => {
    Facility = new Facility();
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
  ixps: () => new Promise((resolve, reject) => {
    IXP = new IXP();
    const SQLquery = `select i.*, ST_AsGeoJSON(point) as point from ix_fac fi
                      left outer join ix i on (fi.ix_id=i.ix_id)
                      left outer join facility f on (fi.fac_id=f.fac_id)`;
    pool.query(SQLquery, async (error, results) => {
      if (error) { throw error; }
      console.log(results.rows.length);
      Promise.all(results.rows.map((f) => IXP.addByTransfer(f))).then((r) => {
        resolve({ m: 'The transfer was finished' });
      }).catch((e) => {
        reject({ m: 'The transfer was finished', r: e });
      });
    });
  }),
  cls: () => new Promise((resolve, reject) => {
    CLS = new CLS();
    const SQLquery = 'SELECT name, state, slug, ST_AsGeoJSON(geom) as point, id as cid FROM cls';
    pool.query(SQLquery, async (error, results) => {
      if (error) { throw error; }
      Promise.all(results.rows.map((f) => CLS.addByTransfer(f))).then((r) => {
        resolve({ m: 'The transfer was finished' });
      }).catch((e) => {
        reject({ m: 'The transfer was finished', r: e });
      });
    });
  }),
  cables: () => new Promise((resolve, reject) => {
    CABLES = new CABLES();
    function bouncer(arr) { return arr.filter(Boolean); }
    const fsegments = (f) => new Promise((resolve, rejecct) => {
      try {
        console.log(f.name);
        const SQLquerySegment = `SELECT segment_id, segment_name, cable_id, status, ST_AsGeoJSON(geom) as geom FROM cable_segment WHERE cable_id = ${f.cable_id}`;
        pool.query(SQLquerySegment, (error, results) => {
          if (error) {
            throw error;
          }
          const rCables = {
            segments: results,
            info: f,
          };
          resolve(rCables);
        });
      } catch (e) { reject(e); }
    });
    function fsegmentsInsert(f) {
      const SQLquerySegment = `SELECT segment_id, segment_name, cable_id, status, ST_AsGeoJSON(geom)::json as geom FROM cable_segment WHERE cable_id = ${f.cable_id}`;
      pool.query(SQLquerySegment, async (error, results) => {
        if (error) {
          throw error;
        }
        let segmentID = 0;
        const cable = {
          cableid: f.cable_id,
          name: f.name,
          systemLength: f.system_length,
          // eslint-disable-next-line radix
          activationDateTime: new Date(parseInt(f.activation_datetime) * 1000),
          urls: bouncer([f.url1, f.url2, f.url3]),
          terrestrial: String(f.is_terrestrial),
          capacityTBPS: f.capacity_tbps,
          fiberPairs: f.fiber_pairs,
          geom: {
            type: 'FeatureCollection',
            features: await Object.keys(results.rows).map((key) => {
              // console.log(y.segments.rows[key]);
              results.rows[key].geom = results.rows[key].geom;// JSON.parse(results.rows[key].geom);
              results.rows[key].geom.id = segmentID;
              segmentID += 1;
              return {
                type: 'Feature',
                properties: { id: String(segmentID) },
                geometry: results.rows[key].geom,
              };
            }),
          },
        };
        console.log(f.name);
        CABLES.addByTransfer(cable);
      });
    }
    const SQLquery = 'SELECT cable_id, name, system_length, activation_datetime, url1, url2, url3, source_url, is_terrestrial, is_inactive, capacity_tbps, eos, fiber_pairs, notes, has_partial_outage, has_outage, premium, id, status FROM cable';
    pool.query(SQLquery, async (error, results) => {
      if (error) { throw error; }
      await results.rows.map((f) => fsegmentsInsert(f));
      resolve({ m: 'The transfer was finished' });
      // Promise.all(results.rows.map((f) => fsegments(f))).then(async (x) => {
      //   console.log(x.length);
      //   let cable = {};
      //   await x.map(async (y) => {
      //     if (y.segments !== undefined) {
      //       if (Array.isArray(y.segments)) {
      //         console.log('Loading cable ', x.info.name);
      //         cable = {
      //           name: y.info.name,
      //           cableid: y.info.cable_id,
      //           systemLength: y.info.system_length,
      //           // eslint-disable-next-line radix
      //           activationDateTime: new Date(parseInt(y.info.activation_datetime) * 1000),
      //           urls: bouncer([y.info.url1, y.info.url2, y.info.url3]),
      //           terrestrial: String(y.info.is_terrestrial),
      //           capacityTBPS: y.info.capacity_tbps,
      //           fiberPairs: y.info.fiber_pairs,
      //           geom: {
      //             type: 'FeatureCollection',
      //             features: await y.segments.map((segment) => { segment.geom = JSON.parse(segment.geom); segment.geom.id = segment.geom; return segment.geom; }),
      //           },
      //         };
      //         CABLES.addByTransfer(cable);
      //       } else {
      //         console.log('Segment is not an array');
      //         console.log('Loading cable ', y.info.name);
      //         let segmentID = 0;
      //         cable = {
      //           cableid: y.info.cable_id,
      //           name: y.info.name,
      //           systemLength: y.info.system_length,
      //           // eslint-disable-next-line radix
      //           activationDateTime: new Date(parseInt(y.info.activation_datetime) * 1000),
      //           urls: bouncer([y.info.url1, y.info.url2, y.info.url3]),
      //           terrestrial: String(y.info.is_terrestrial),
      //           capacityTBPS: y.info.capacity_tbps,
      //           fiberPairs: y.info.fiber_pairs,
      //           geom: {
      //             type: 'FeatureCollection',
      //             features: await Object.keys(y.segments.rows).map((key) => {
      //               // console.log(y.segments.rows[key]);
      //               y.segments.rows[key].geom = JSON.parse(y.segments.rows[key].geom);
      //               y.segments.rows[key].geom.id = segmentID;
      //               segmentID += 1;
      //               return {
      //                 type: 'Feature',
      //                 properties: { id: String(segmentID) },
      //                 geometry: y.segments.rows[key].geom,
      //               };
      //             }),
      //           },
      //         };
      //         CABLES.addByTransfer(cable);
      //       }
      //     } else {
      //       console.log('Segment is undefined');
      //     }
      //   });
      // }).catch((e) => {
      //   reject({ m: 'The transfer was finished', r: e });
      // });
    });
  }),
  cableowners: () => new Promise((resolve, reject) => {
    const SQLquery = '';
    pool.query(SQLquery, (error, results) => {
      if (error) {
        throw error;
      }
      console.log(results);
    });
  }),
};
