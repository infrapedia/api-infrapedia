const { logoUploadFiles, kmzUploadFiles } = require('./helpers/gcloudStorage');

module.exports = {
  logo: (user, idata) => {
    return new Promise((resolve, reject) => {
      try {
        logoUploadFiles(idata.file, user).then((lks) => {
          resolve({ m: 'loaded', r: lks });
        }).catch((e) => {
          reject({ m: e });
        });
      } catch (e) { reject({ m: e }); }
    });
  },
  kmz: (user, idata) => {
    return new Promise((resolve, reject) => {
      try {
        console.log( idata );
        kmzUploadFiles(idata.file, user).then((lks) => {
          resolve({ m: 'loaded', r: lks });
        }).catch((e) => {
          reject({ m: e });
        });
      } catch (e) { reject({ m: e }); }
    });
  },
}
