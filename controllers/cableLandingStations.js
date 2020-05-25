let CLS = require('./class/CableLandingStation');
const redisClient = require('../config/redis');

CLS = new CLS();
module.exports = {
  add: (usr, data) => CLS.add(usr, data),
  edit: (usr, data) => CLS.edit(usr, data),
  list: (usr, page) => CLS.list(usr, page),
  delete: (usr, id) => CLS.delete(usr, id),
  owner: (usr, id) => CLS.owner(usr, id),
  bbox: (user, id) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`cls_${id}`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  view: (usr, id) => CLS.view(usr, id),
  search: (usr, query) => CLS.search(usr, query),
  getElementGeom: (usr, id) => CLS.getElementGeom(id),
  getMultiElementsGeom: (usr, ids) => CLS.getMultiElementsGeom(ids),
  updateCable: (usr, ids) => CLS.updateCable(usr, ids.cls, ids.cable),
  removeCable: (usr, ids) => CLS.removeCable(usr, ids.cls, ids.cable),
  listOfCables: (usr, ids) => CLS.listOfCables(usr, ids),
  listOfCLSbyCable: (usr, ids) => CLS.listOfCLSbyCable(usr, ids),
};
