let AlertProvider = require('./class/AlertProvider');

AlertProvider = new AlertProvider();
module.exports = {
  configProviderEmail: (usr, data) => AlertProvider.configProviderEmail(usr, data),
  getEmailProvider: (usr) => AlertProvider.getEmailProvider(usr),
}
