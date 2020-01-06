let Issue = require('./class/Issue');

Issue = new Issue();
module.exports = {
  report: (usr, data) => Issue.report(usr, data),
  myReports: (usr, data) => Issue.myReports(usr, data),
}
