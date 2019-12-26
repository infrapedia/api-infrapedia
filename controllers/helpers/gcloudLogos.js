const mime = require('mime');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env._GG_PROJECT_ID,
  keyFilename: 'keys/hale-cocoa-231721-ca05829368f5.json',
});
const bucket = storage.bucket(process.env._GG_CLOUD_BUCKET);
const allowedExtensionsImg = /(\.jpg|\.jpeg)$/i;

function uploadFile(path, user, allowedExtensions) {
  return new Promise((resolve, reject) => {
    if (allowedExtensions.exec(path)) {
      const ufile = `${user}-logo-${uuidv4()}${allowedExtensionsImg.exec(path)[1]}`;
      const bucketFile = bucket.file(`${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
      fs.createReadStream(path)
        .pipe(bucketFile.createWriteStream({
          metadata: {
            contentType: mime.getType(path),
          },
        })).on('error', (err) => { reject(err); }).on('finish', () => {
          bucketFile.makePublic().then(() => {
            //resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
            resolve(`https://storage.googleapis.com/${process.env._GG_CLOUD_BUCKET}/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
          });
        });
    } else {
      resolve(0);
    }
  });
}

module.exports = {
  imagesUploadFiles: (files, user) => new Promise((resolve) => {
    try {
      if (files === undefined) {
        resolve([]);
      } else if (Array.isArray(files)) {
        Promise.all(files.map((x) => uploadFile(x.path, user, allowedExtensionsImg))).then((filesArray) => {
          resolve(filesArray.filter(Boolean));
        })
          .catch(() => { resolve([]); });
      } else { uploadFile(files.path, user, allowedExtensionsImg).then((fileArray) => { resolve((fileArray != 0) ? [fileArray] : []); }).catch(() => { resolve([]); }); }
    } catch (err) { resolve(err); }
  }),
};
