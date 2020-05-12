let Map = require('./class/Map');

Map = new Map();
module.exports = {
  myMap: (usr, data) => Map.myMap(usr, data),
  getMyMap: (usr, data) => Map.getMyMap(usr, data),
  ixps: (subdomain) => Map.ixps(subdomain),
  facilities: (subdomain) => Map.facilities(subdomain),
  cls: (subdomain) => Map.cls(subdomain),
  draw: (subdomain) => Map.draw(subdomain),
  cables: (subdomain) => Map.cables(subdomain),
  getInfo: (subdomain) => Map.getinfo(subdomain),
  setInfo: (subdomain) => Map.setInfo(subdomain),
}
