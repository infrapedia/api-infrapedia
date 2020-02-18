let Map = require('./class/Map');

Map = new Map();
module.exports = {
  myMap: (usr, data) => Map.myMap(usr, data),
  getMyMap: (usr, data) => Map.getMyMap(usr, data),
}
