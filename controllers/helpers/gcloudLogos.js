// const mime = require('mime');
// const fs = require('fs');
// const uuidv4 = require('uuid/v4');
// const { Storage } = require('@google-cloud/storage');
//
// const storage = new Storage({
//   projectId: process.env._GG_PROJECT_ID,
//   keyFilename: 'keys/gcloudstorage.json',
// });
// const bucket = storage.bucket(process.env._GG_CLOUD_BUCKET);
// const allowedExtensionsImg = /(\.jpg|\.jpeg)$/i;
//
// function uploadFile(path, user, allowedExtensions) {
//   return new Promise((resolve, reject) => {
//     if (allowedExtensions.exec(path)) {
//       const ufile = `${user}-report-${uuidv4()}${allowedExtensionsImg.exec(path)[1]}`;
//       const bucketFile = bucket.file(`${process.env._GG_CLOUD_BUCKET_FOLDER}/${ufile}`);
//       fs.createReadStream(path)
//         .pipe(bucketFile.createWriteStream({
//           metadata: {
//             contentType: mime.getType(path),
//           },
//         })).on('error', (err) => { reject(err); }).on('finish', () => {
//           bucketFile.makePublic().then(() => {
//             resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER}/${ufile}`);
//           });
//         });
//     } else {
//       resolve(0);
//     }
//   });
// }
