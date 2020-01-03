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
const allowedExtensionsKmz = /(\.kmz|\.KMZ)$/i;

// function uploadFileLogo(path, user, allowedExtensions) {
//   return new Promise((resolve, reject) => {
//     if (allowedExtensions.exec(path)) {
//       const ufile = `logo-${uuidv4()}${allowedExtensionsImg.exec(path)[1]}`;
//       const bucketFile = bucket.file(`${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${user}/${ufile}`);
//       fs.createReadStream(path)
//         .pipe(bucketFile.createWriteStream({
//           metadata: {
//             contentType: mime.getType(path),
//           },
//         })).on('error', (err) => { reject(err); }).on('finish', () => {
//           bucketFile.makePublic().then(() => {
//             // resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
//             resolve(`https://storage.googleapis.com/${process.env._GG_CLOUD_BUCKET}/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${user}/${ufile}`);
//           });
//         });
//     } else {
//       resolve(0);
//     }
//   });
// }
//
// function uploadFileKmz(path, user, allowedExtensions) {
//   return new Promise((resolve, reject) => {
//     if (allowedExtensions.exec(path)) {
//       const ufile = `kmz-${uuidv4()}${allowedExtensions.exec(path)[1]}`;
//       const bucketFile = bucket.file(`${process.env._GG_CLOUD_BUCKET_FOLDER_KMZ}/${user}/${ufile}`);
//       fs.createReadStream(path)
//         .pipe(bucketFile.createWriteStream({
//           metadata: {
//             contentType: mime.getType(path),
//           },
//         })).on('error', (err) => { reject(err); }).on('finish', () => {
//           bucketFile.makePublic().then(() => {
//           // resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
//             resolve(`https://storage.googleapis.com/${process.env._GG_CLOUD_BUCKET}/${process.env._GG_CLOUD_BUCKET_FOLDER_KMZ}/${user}/${ufile}`);
//           });
//         });
//     } else {
//       resolve(0);
//     }
//   });
// }

function upload(path, user, allowedExtensions, folder) {
  return new Promise((resolve, reject) => {
    if (allowedExtensions.exec(path)) {
      const ufile = `${folder}-${uuidv4()}${allowedExtensions.exec(path)[1]}`;
      const bucketFile = bucket.file(`${folder}/${user}/${ufile}`);
      fs.createReadStream(path)
        .pipe(bucketFile.createWriteStream({
          metadata: {
            contentType: mime.getType(path),
          },
        })).on('error', (err) => { reject(err); }).on('finish', () => {
          bucketFile.makePublic().then(() => {
          // resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
            resolve(`https://storage.googleapis.com/${process.env._GG_CLOUD_BUCKET}/${folder}/${user}/${ufile}`);
          });
        });
    } else {
      resolve(0);
    }
  });
}


module.exports = {
  logoUploadFiles: (files, user) => new Promise((resolve) => {
    try {
      if (files === undefined) {
        resolve([]);
      } else if (Array.isArray(files)) {
        Promise.all(files.map((x) => upload(x.path, user, allowedExtensionsImg, process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS))).then((filesArray) => {
          resolve(filesArray.filter(Boolean));
        })
          .catch(() => { resolve([]); });
      } else { upload(files.path, user, allowedExtensionsImg, process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS).then((fileArray) => { resolve((fileArray !== 0) ? [fileArray] : []); }).catch(() => { resolve([]); }); }
    } catch (err) { resolve(err); }
  }),
  kmzUploadFiles: (files, user) => new Promise((resolve) => {
    try {
      if (files === undefined) {
        resolve([]);
      } else if (Array.isArray(files)) {
        Promise.all(files.map((x) => upload(x.path, user, allowedExtensionsKmz, process.env._GG_CLOUD_BUCKET_FOLDER_KMZ))).then((filesArray) => {
          resolve(filesArray.filter(Boolean));
        }).catch(() => { resolve([]); });
      } else { upload(files.path, user, allowedExtensionsKmz, process.env._GG_CLOUD_BUCKET_FOLDER_KMZ).then((fileArray) => { resolve((fileArray !== 0) ? [fileArray] : []); }).catch(() => { resolve([]); }); }
    } catch (err) { resolve(err); }
  }),
};
