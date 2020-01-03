let Cable = require('./class/Cable');

Cable = new Cable();
module.exports = {
  add: (usr, data) => Cable.add(usr, data),
  edit: (usr, data) => Cable.edit(usr, data),
  list: (usr) => Cable.list(usr),
  delete: (usr, id) => Cable.delete(usr, id),
  owner: (usr, id) => Cable.owner(usr, id),
};
