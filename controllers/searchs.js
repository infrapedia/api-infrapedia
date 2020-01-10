let Search = require('./class/Search');

Search = new Search();
module.exports = {
  byField: (usr, data) => Search.byField(usr, data),
};