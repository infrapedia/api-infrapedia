let CLS = require('./class/CableLandingStation');

CLS = new CLS();
module.exports = {
  add: (usr, data) => CLS.add(usr, data),
  edit: (usr, data) => CLS.edit(usr, data),
  list: (usr) => CLS.list(usr),
  delete: (usr, id) => CLS.delete(usr, id),
  owner: (usr, id) => CLS.owner(usr, id),
  bbox: (usr, id) => CLS.bbox(usr, id),
  view: (usr, id) => CLS.view(usr, id),
  search: (usr, id) => CLS.search(usr, id),
  getElementGeom: (usr, id) => CLS.getElementGeom(id),
  getMultiElementsGeom: (usr, ids) => CLS.getMultiElementsGeom(ids),
};
