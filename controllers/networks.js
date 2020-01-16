let Network = require('./class/Network');

Network = new Network();
module.exports = {
  add: (usr, data) => Network.add(usr, data),
  edit: (usr, data) => Network.edit(usr, data),
  list: (usr) => Network.list(usr),
  delete: (usr, id) => Network.delete(usr, id),
  owner: (usr, id) => Network.owner(usr, id),
  view: (usr, id) => Network.view(usr, id),
  search: (usr, id) => Network.search(usr, id),
};
