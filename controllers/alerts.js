let Alert = require('./class/Alert');

Alert = new Alert();
module.exports = {
  add: (usr, data) => Alert.Add(usr, data),
  disabled: (usr, data) => Alert.Disabled(usr, data),
  configuredAlerts: (usr, page) => Alert.configuredAlerts(usr, page),
}
