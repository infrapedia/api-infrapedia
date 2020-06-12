let Network = require('./class/Network');

Network = new Network();
module.exports = {
  add: (usr, data) => Network.add(usr, data),
  edit: (usr, data) => Network.edit(usr, data),
  list: (usr, page) => Network.list(usr, page),
  delete: (usr, id) => Network.delete(usr, id),
  owner: (usr, id) => Network.owner(usr, id),
  view: (usr, id) => Network.view(usr, id),
  search: (usr, query) => Network.search(usr, query),
  checkName: (name) => Network.checkName(name),
};
