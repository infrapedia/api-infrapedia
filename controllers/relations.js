const pool = require('../config/pgSQL.js');
const CABLES = require('./class/Cable');

module.exports = {
  cables: () => new Promise((resolve, reject) => {
    try {
      // First we're going to search the cls connection

    } catch (e) { reject(e); }
  }),
};
