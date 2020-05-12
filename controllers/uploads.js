const { logoUploadFiles, kmzUploadFiles } = require('./helpers/gcloudStorage');

module.exports = {
  logo: (user, idata) => new Promise((resolve, reject) => {
    try {
      logoUploadFiles(idata.file, user).then((lks) => {
        resolve({ m: 'loaded', r: lks });
      }).catch((e) => {
        console.log(e);
        reject({ m: e });
      });
    } catch (e) { reject({ m: e }); }
  }),
  kmz: (user, idata) => new Promise((resolve, reject) => {
    try {
      kmzUploadFiles(idata.file, user).then((lks) => {
        resolve({ m: 'loaded', r: lks });
      }).catch((e) => {
        reject({ m: e });
      });
    } catch (e) { reject({ m: e }); }
  }),
};
