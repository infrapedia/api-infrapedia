let Map = require('./class/Map');
const redisClient = require('../config/redis');

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
  generateData: (usr) => Map.generateData(usr),
  getCables: (subdomain) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`${subdomain}_cables`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  getCls: (subdomain) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`${subdomain}_cls`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  getIxps: (subdomain) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`${subdomain}_ixps`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  getFacilities: (subdomain) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`${subdomain}_facilities`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  getDraw: (subdomain) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`${subdomain}_draw`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
  getDataInfo: (subdomain) => new Promise((resolve, reject) => {
    redisClient.redisClient.get(`${subdomain}_info`, (err, reply) => {
      if (err) reject({ m: err });
      resolve(JSON.parse(reply));
    });
  }),
};
