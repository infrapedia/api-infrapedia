const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Map {
  constructor() {
    this.model = require('../../models/map.model');
  }

  // Add() {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.model
  //     } catch (e) { reject({ m: e }); }
  //   });
  // }
}
module.exports = Map;
