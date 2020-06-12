const redisClient = require('../config/redis');

let Cable = require('./class/Cable');

Cable = new Cable();
module.exports = {
  add: (usr, data) => Cable.add(usr, data),
  edit: (usr, data) => Cable.edit(usr, data),
  listT: (usr, page) => Cable.listT(usr, page),
  listS: (usr, page) => Cable.listS(usr, page),
  shortList: (usr) => Cable.shortList(usr),
  delete: (usr, id) => Cable.delete(usr, id),
  owner: (usr, id) => Cable.owner(usr, id),
  bbox: (user, id) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`cable_${id}`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  bboxEdit: (user, id) => Cable.bbox(id),
  view: (usr, id) => Cable.view(usr, id),
  search: (usr, id) => Cable.search(usr, id),
  searchT: (usr, query) => Cable.searchT(usr, query),
  searchS: (usr, query) => Cable.searchS(usr, query),
  getElementGeom: (usr, id) => Cable.getElementGeom(id),
  getMultiElementsGeom: (usr, ids) => Cable.getMultiElementsGeom(ids),
  relationsTransfer: () => Cable.relationsTransfer(),
  checkName: (name) => Cable.checkName(name),
};
