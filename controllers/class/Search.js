const luxon = require('luxon');
const { ObjectID } = require('mongodb');

class Search {
  constructor() {
    this.model = require('../../models/cable.model');
  }

  cables() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  cls() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  networks() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  facilities() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  ixps() {
    return new Promise((resolve, reject) => {
      try {

      } catch (e) {}
    });
  }

  search(user, data){
    return new Promise((Resolve, reject) => {
      try {
        Promsie.all([cables()]).then((r) => {

        }).catch((e) => { reject({ m: e }); });
      } catch (e) { reject({ m: e }); }
    });
  }
}
