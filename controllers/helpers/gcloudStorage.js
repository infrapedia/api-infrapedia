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
const allowedExtensionsGeoJson = /(\.geojson|\.GEOJSON)$/i;

function uploadFileLogo(path, user, allowedExtensions, folder) {
  return new Promise((resolve, reject) => {
    if (allowedExtensions.exec(path)) {
      const ufile = `logo-${uuidv4()}${allowedExtensionsImg.exec(path)[1]}`;
      const bucketFile = bucket.file(`${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${user}/${ufile}`);
      fs.createReadStream(path)
        .pipe(bucketFile.createWriteStream({
          metadata: {
            contentType: mime.getType(path),
          },
        })).on('error', (err) => { reject(err); }).on('finish', () => {
          bucketFile.makePublic().then(() => {
            // resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
            resolve(`https://storage.googleapis.com/${process.env._GG_CLOUD_BUCKET}/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${user}/${ufile}`);
          });
        });
    } else {
      resolve(0);
    }
  });
}

function uploadFileKmz(path, user, allowedExtensions, folder) {
  return new Promise((resolve, reject) => {
    if (allowedExtensions.exec(path)) {
      const ufile = `kmz-${uuidv4()}${allowedExtensions.exec(path)[1]}`;
      const bucketFile = bucket.file(`${process.env._GG_CLOUD_BUCKET_FOLDER_KMZ}/${user}/${ufile}`);
      fs.createReadStream(path)
        .pipe(bucketFile.createWriteStream({
          metadata: {
            contentType: mime.getType(path),
          },
        })).on('error', (err) => { reject(err); }).on('finish', () => {
          bucketFile.makePublic().then(() => {
          // resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
            resolve(`https://storage.googleapis.com/${process.env._GG_CLOUD_BUCKET}/${process.env._GG_CLOUD_BUCKET_FOLDER_KMZ}/${user}/${ufile}`);
          });
        });
    } else {
      resolve(0);
    }
  });
}

function upload(path, user, allowedExtensions, folder) {
  return new Promise((resolve, reject) => {
    if (allowedExtensions.exec(path)) {
      console.log('testing');
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
            resolve(`${process.env._CDN_ROUTE_FILES}/${folder}/${user}/${ufile}`);
          });
        });
    } else {
      resolve(0);
    }
  });
}


function uElementsFile(path, user, folder) {
  return new Promise((resolve, reject) => {
    if (allowedExtensionsGeoJson.exec(path) || allowedExtensionsKmz.exec(path)) {
      console.log(path);
      let allowedExtensions = (allowedExtensionsKmz.exec(path)) ? allowedExtensionsKmz.exec(path) : allowedExtensionsGeoJson.exec(path);
      const ufile = `${folder}-${uuidv4()}${allowedExtensions[1]}`;
      const bucketFile = bucket.file(`${folder}/${user}/${ufile}`);
      fs.createReadStream(path)
        .pipe(bucketFile.createWriteStream({
          metadata: {
            contentType: mime.getType(path),
          },
        })).on('error', (err) => { reject(err); }).on('finish', () => {
          bucketFile.makePublic().then(() => {
          // resolve(`https://clients.agrimanager.app/${process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS}/${ufile}`);
            resolve(`${process.env._CDN_ROUTE_FILES}/${folder}/${user}/${ufile}`);
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
        Promise.all(files.map((x) => uploadFileLogo(x.path, user, allowedExtensionsImg, process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS))).then((filesArray) => {
          resolve(filesArray.filter(Boolean));
        })
          .catch(() => { resolve([]); });
      } else { uploadFileLogo(files.path, user, allowedExtensionsImg, process.env._GG_CLOUD_BUCKET_FOLDER_LOGOS).then((fileArray) => { resolve((fileArray !== 0) ? [fileArray] : []); }).catch(() => { resolve([]); }); }
    } catch (err) { resolve(err); }
  }),
  kmzUploadFiles: (files, user) => new Promise((resolve) => {
    try {
      if (files === undefined) {
        resolve([]);
      } else if (Array.isArray(files)) {
        Promise.all(files.map((x) => uploadFileKmz(x.path, user, allowedExtensionsKmz, process.env._GG_CLOUD_BUCKET_FOLDER_KMZ))).then((filesArray) => {
          resolve(filesArray.filter(Boolean));
        }).catch(() => { resolve([]); });
      } else { uploadFileKmz(files.path, user, allowedExtensionsKmz, process.env._GG_CLOUD_BUCKET_FOLDER_KMZ).then((fileArray) => { resolve((fileArray !== 0) ? [fileArray] : []); }).catch(() => { resolve([]); }); }
    } catch (err) { resolve(err); }
  }),
  uploadElementsFile: (files, user) => new Promise((resolve) => {
    try {
      if (files === undefined) {
        resolve([]);
      } else if (Array.isArray(files)) {
        Promise.all(files.map((x) => uElementsFile(x.path, user, process.env._GG_CLOUD_BUCKET_FOLDER_EEDITED))).then((filesArray) => {
          resolve(filesArray.filter(Boolean));
        }).catch(() => { resolve([]); });
      } else { uElementsFile(files.path, user, process.env._GG_CLOUD_BUCKET_FOLDER_EEDITED).then((fileArray) => { resolve((fileArray !== 0) ? [fileArray] : []); }).catch(() => { resolve([]); }); }
    } catch (err) { resolve(err); }
  }),
};
