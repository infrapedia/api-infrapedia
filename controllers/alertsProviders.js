let AlertProvider = require('./class/AlertProvider');

AlertProvider = new AlertProvider();
module.exports = {
  configProvider: (usr, data) => AlertProvider.configProvider(usr, data),
}
