const { Pool } = require('pg');

const pool = new Pool({
  user: process.env._PGSQL_user,
  host: process.env._PGSQL_host,
  database: process.env._PGSQL_database,
  password:process.env. _PGSQL_password,
  port: process.env._PGSQL_port,
});

module.exports = pool;
