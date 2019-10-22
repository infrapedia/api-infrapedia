let Organization = require('./class/Organization')

Organization = new Organization()
module.exports = {
  add: (usr, data) => Organization.add(usr, data),
  edit: (usr, data) => Organization.edit(usr, data),
};
