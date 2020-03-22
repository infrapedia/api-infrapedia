const pool = require('../config/pgSQL.js');
let IXP = require('./class/InternetExchangePoint');

IXP = new IXP();
module.exports = {
  search: (usr, id) => IXP.search(usr, id),
  view: (usr, id) => IXP.view(usr, id),
  bbox: (usr, id) => IXP.bbox(usr, id),
  getElementGeom: (usr, id) => IXP.getElementGeom(id),
  getMultiElementsGeom: (usr, ids) => IXP.getMultiElementsGeom(ids),
};
