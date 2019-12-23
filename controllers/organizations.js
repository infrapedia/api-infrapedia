let Organization = require('./class/Organization')

Organization = new Organization()
module.exports = {
  add: (usr, data) => Organization.add(usr, data),
  edit: (usr, data) => Organization.edit(usr, data),
  list: (usr) => Organization.list(usr),
  delete: (usr, id) => Organization.delete(usr, id),
};
