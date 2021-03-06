let Cloud = require('./class/Cloud');
const redisClient = require('../config/redis');

Cloud = new Cloud();
module.exports = {
  add: (usr, data) => Cloud.add(usr, data),
  edit: (usr, data) => Cloud.edit(usr, data),
  owner: (usr, id) => Cloud.owner(usr, id),
  list: (usr, page) => Cloud.list(usr, page),
  search: (usr, id) => Cloud.search(usr, id),
};
