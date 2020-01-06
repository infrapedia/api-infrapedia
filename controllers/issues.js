let Issue = require('./class/Issue');

Issue = new Issue();
module.exports = {
  addReport: (usr, data) => Issue.addReport(usr, data),
  myReports: (usr, data) => Issue.myReports(usr, data),
}
