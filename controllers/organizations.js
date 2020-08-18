let Organization = require('./class/Organization');

Organization = new Organization();
module.exports = {
  add: (usr, data) => Organization.add(usr, data),
  edit: (usr, data) => Organization.edit(usr, data),
  list: (usr, page) => Organization.list(usr, page),
  delete: (usr, id) => Organization.delete(usr, id),
  owner: (usr, id) => Organization.owner(usr, id),
  view: (usr, id) => Organization.view(usr, id),
  search: (usr, query) => Organization.search(usr, query),
  partners: () => Organization.partners(),
  istrusted: () => Organization.istrusted(),
  checkName: (name) => Organization.checkName(name),
  associationsGroups: (id) => Organization.associationsGroups(id),
  associationsCLS: (id) => Organization.associationsCLS(id),
  associationsSubseas: (id) => Organization.associationsSubseas(id),
  associationsSubseasKU: (id) => Organization.associationsSubseasKU(id),
  associationsTerrestrials: (id) => Organization.associationsTerrestrials(id),
  associationsIXPS: (id) => Organization.associationsIXPS(id),
  associationsFacilities: (id) => Organization.associationsFacilities(id),
  permanentDelete: (usr, id, code) => Organization.permanentDelete(usr, id, code),
  updateOrganizationCable: (usr, idOrganization, idCable, operation) => Organization.updateOrganizationCable(usr, idOrganization, idCable, operation),
};
