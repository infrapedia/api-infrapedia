const luxon = require('luxon');
const u = require('./helpers/gcloudStorage');
const { ObjectID } = require('mongodb');

module.exports = {
  uploadInformation: (usr, idata) => new Promise((resolve, reject) => {
    try {
      const editElements = require('../models/editElements.model');
      u.uploadElementsFile(idata.file, usr).then((lks) => {
        editElements().then((editE) => {
          editE.insertOne({
            uuid: String(usr),
            elemnt: new ObjectID(idata.elemnt),
            t: String(idata.t),
            information: String(idata.information),
            lks,
            rgDate: luxon.DateTime.utc(),
          }, (err, i) => {
            if (err) { reject({ m: err }); }
            resolve({ m: 'Thank you for helping us improve our information.' });
          });
        }).catch((e) => { reject({ m: e }); });
      });
    } catch (e) { reject({ m: e }); }
  }),
};
