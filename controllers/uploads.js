const gcloud = require('./helpers/gcloudLogos');

module.exports = {
  logo: (user, idata) => {
    return new Promise((resolve, reject) => {
      try {
        gcloud.imagesUploadFiles(idata.file, user).then((lks) => {
          resolve({ m: 'loaded', r: lks });
        }).catch((e) => {
          reject({ m: e });
        });
      } catch (e) { reject({ m: e }); }
    });
  },
}
