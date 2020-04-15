const bboxs = {
  cables: () => new Promise((resolve, reject) => {
    let Cable = require('./class/Cable'); Cable = new Cable();
    Cable.createBBOXs().then(() => resolve()).catch(() => reject());
  }),
  cls: () => new Promise((resolve, reject) => {
    let CLS = require('./class/CableLandingStation'); CLS = new CLS();
    CLS.createBBOXs().then(() => resolve()).catch(() => reject());
  }),
  ixps: () => new Promise((resolve, reject) => {
    let IXP = require('./class/InternetExchangePoint'); IXP = new IXP();
    IXP.createBBOXs().then(() => resolve()).catch(() => reject());
  }),
  facilities: () => new Promise((resolve, reject) => {
    let Facility = require('./class/Facility'); Facility = new Facility();
    Facility.createBBOXs().then(() => resolve()).catch(() => reject());
  }),
  dataCables: () => new Promise((resolve, reject) => {
    let Cable = require('./class/Cable'); Cable = new Cable();
    Cable.createDATA().then(() => resolve()).catch(() => reject());
  }),
  dataCLS: () => new Promise((resolve, reject) => {
    let CLS = require('./class/CableLandingStation'); CLS = new CLS();
    CLS.createDATA().then(() => resolve()).catch(() => reject());
  }),
  dataIXPS: () => new Promise((resolve, reject) => {
    let IXP = require('./class/InternetExchangePoint'); IXP = new IXP();
    IXP.createDATA().then(() => resolve()).catch(() => reject());
  }),
  dataFacilities: () => new Promise((resolve, reject) => {
    let Facility = require('./class/Facility'); Facility = new Facility();
    Facility.createDATA().then(() => resolve()).catch(() => reject());
  }),
}
module.exports = bboxs;
