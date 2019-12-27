let CLS = require('./class/cableLandingStation');

CLS = new CLS();
module.exports = {
  add: (usr, data) => CLS.add(usr, data),
  edit: (usr, data) => CLS.edit(usr, data),
  list: (usr) => CLS.list(usr),
  delete: (usr, id) => CLS.delete(usr, id),
};
