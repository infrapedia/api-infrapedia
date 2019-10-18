const information = {
  name: process.env._PROJ_NAME,
  port: (process.env._ENV === 'dev') ? process.env._PORT_DEV : process.env._PORT_PROD,
  redis: {
    domain: process.env._RDS_DOMAIN,
    port: process.env._RDS_PORT,
    passw: process.env._RDS_PASSW
  },
  mongodb: {
    domain: process.env._DB_DOMAIN,
    port: process.env._DB_PORT,
    name: process.env._DB_NAME
  },
}

module.exports = information;