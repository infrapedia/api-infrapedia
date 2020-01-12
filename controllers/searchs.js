let Search = require('./class/Search');

Search = new Search();
module.exports = {
  byField: (usr, data) => Search.byField(usr, data),
  byFieldCables: (usr, data) => Search.byFieldCables(usr, data),
  byFieldCls: (usr, data) => Search.byFieldCls(usr, data),
  byFieldNetworks: (usr, data) => Search.byFieldNetworks(usr, data),
  byFieldOrgs: (usr, data) => Search.byFieldOrgs(usr, data),
};
