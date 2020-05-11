let Search = require('./class/Search');

Search = new Search();
module.exports = {
  byField: (usr, data) => Search.byField(usr, data.trim()),
  byFieldCables: (usr, data) => Search.byFieldCables(usr, data.trim()),
  byFieldCls: (usr, data) => Search.byFieldCls(usr, data.trim()),
  byFieldNetworks: (usr, data) => Search.byFieldNetworks(usr, data.trim()),
  byFieldOrgs: (usr, data) => Search.byFieldOrgs(usr, data.trim()),
  byFieldFacility: (usr, data) => Search.byFieldFacility(usr, data.trim()),
  byFieldIXP: (usr, data) => Search.byFieldIXP(usr, data.trim()),
};
