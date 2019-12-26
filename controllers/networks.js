let Network = require('./class/Network');

Network = new Network();
module.exports = {
  add: (usr, data) => Network.add(usr, data),
  edit: (usr, data) => Network.edit(usr, data),
  list: (usr) => Network.list(usr),
};
