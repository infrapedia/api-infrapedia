let Cable = require('./class/Cable');

Cable = new Cable();
module.exports = {
  add: (usr, data) => Cable.add(usr, data),
  edit: (usr, data) => Cable.edit(usr, data),
  list: (usr) => Cable.list(usr),
  shortList: (usr) => Cable.shortList(usr),
  delete: (usr, id) => Cable.delete(usr, id),
  owner: (usr, id) => Cable.owner(usr, id),
  bbox: (usr, id) => Cable.bbox(usr, id),
  view: (usr, id) => Cable.view(usr, id),
  search: (usr, id) => Cable.search(usr, id),
  getElementGeom: (usr, id) => Cable.getElementGeom(id),
};
