let Organization = require('./class/Organization')

Organization = new Organization()
module.exports = {
  add: (usr, data) => Organization.add(usr, data),
  edit: (usr, data) => Organization.edit(usr, data),
  list: (usr, page) => Organization.list(usr, page),
  delete: (usr, id) => Organization.delete(usr, id),
  owner: (usr, id) => Organization.owner(usr, id),
  view: (usr, id) => Organization.view(usr, id),
  search: (usr, id) => Organization.search(usr, id),
  partners: () => Organization.partners(),
  istrusted: () => Organization.istrusted(),
};
