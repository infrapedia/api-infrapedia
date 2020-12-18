const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const pool = require('../../config/pgSQL');

class PeeringDb {
  getIXPSConnection(id) {
    return new Promise((resolve, reject) => {
      const SQLQuery = 'SELECT * FROM public.org_ix LEFT JOIN public.ix ON org_ix.ix_id = ix.ix_id WHERE org_ix.org_id = 2';
      pool.query(SQLQuery, async (error, results) => {
        if (error) { throw error; }
        resolve(results.rows);
      });
    });
  }

  getIXPSConnectionByLocation(location) {
    return new Promise((resolve, reject) => {
      const SQLQuery = `SELECT ix_id, org_id, name, city, media, tech_email, status, country FROM public.ix where city LIKE '%${location}%' OR country like '%${location}%'`;
      pool.query(SQLQuery, async (error, results) => {
        if (error) { throw error; }
        resolve(results.rows);
      });
    });
  }

  getMyConnection(orgId) {
    return new Promise((resolve, reject) => {
      const SQLQuery = `SELECT org_id, ix_id FROM public.org_ix WHERE org_id = '${orgId}'`;
      pool.query(SQLQuery, async (error, results) => {
        if (error) { throw error; }
        resolve(results.rows);
      });
    });
  }
}
module.exports = PeeringDb;
