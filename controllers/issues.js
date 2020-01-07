let Issue = require('./class/Issue');

Issue = new Issue();
module.exports = {
  addReport: (usr, data) => Issue.addReport(usr, data),
  reports: (usr, data) => Issue.reports(usr, data),
}
