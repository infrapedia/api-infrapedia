const pool = require('../config/pgSQL.js');
let IXP = require('./class/InternetExchangePoint');

IXP = new IXP();
module.exports = {
  search: (usr, id) => IXP.search(usr, id),
  transferIXPS: () => new Promise((resolve, reject) => {
    const SQLquery = `select i.*, ST_AsGeoJSON(point) as point from ix_fac fi
                      left outer join ix i on (fi.ix_id=i.ix_id)
                      left outer join facility f on (fi.fac_id=f.fac_id)`;
    pool.query(SQLquery, async (error, results) => {
      if (error) { throw error; }
      Promise.all(results.rows.map((f) => IXP.addByTransfer('', f))).then((r) => {
        resolve({ m: 'The transfer was finished' });
      }).catch((e) => {
        reject({ m: 'The transfer was finished', r: e });
      });
    });
  }),
};
