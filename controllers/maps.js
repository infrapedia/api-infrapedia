let Map = require('./class/Map');

Map = new Map();
module.exports = {
  myMap: (usr, data) => Map.myMap(usr, data),
  getMyMap: (usr, data) => Map.getMyMap(usr, data),
  ixps: (usr, data) => Map.ixps(usr, data),
  facilities: (usr, data) => Map.facilities(usr, data),
  cls: (usr, data) => Map.cls(usr, data),
  draw: (usr, data) => Map.draw(usr, data),
  cables: (usr, data) => Map.cables(usr, data),
}
