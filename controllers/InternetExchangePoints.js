const pool = require('../config/pgSQL.js');
let IXP = require('./class/InternetExchangePoint');
const redisClient = require('../config/redis');

IXP = new IXP();
module.exports = {
  search: (usr, query) => IXP.search(usr, query),
  owner: (usr, id) => IXP.owner(usr, id),
  view: (usr, id) => IXP.view(usr, id),
  bbox: (user, id) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`ixp_${id}`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  getElementGeom: (usr, id) => IXP.getElementGeom(id),
  getMultiElementsGeom: (usr, ids) => IXP.getMultiElementsGeom(ids),
  add: (usr, data) => IXP.add(usr, data),
  edit: (usr, data) => IXP.edit(usr, data),
  list: (usr, page) => IXP.list(usr, page),
  delete: (usr, id) => IXP.delete(usr, id),
};
