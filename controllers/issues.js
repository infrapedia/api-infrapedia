let Issue = require('./class/Issue');

Issue = new Issue();
module.exports = {
  addReport: (usr, data) => Issue.addReport(usr, data),
  reports: (usr, data) => Issue.reports(usr, data),
  myReports: (usr, data) => Issue.myReports(usr, data),
  viewReport: (usr, id, elemnt) => Issue.viewReport(usr, id, elemnt),
  deleteMyReport: (usr, id) => Issue.deleteMyReport(usr, id),
  permanentDelete: (usr, id, code) => Issue.permanentDelete(usr, id, code),
};
