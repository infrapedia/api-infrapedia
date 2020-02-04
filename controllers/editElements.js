const luxon = require('luxon');
const u = require('./helpers/gcloudStorage');

module.exports = {
  uploadInformation: (usr, idata) => new Promise((resolve, reject) => {
    try {
      const editElements = require('../models/editElements.model');
      u.uploadElementsFile(idata.file, usr).then((lks) => {
        editElements().then((editE) => {
          editE.insertOne({
            uuid: String(usr),
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
