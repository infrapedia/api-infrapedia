const fs = require('fs');
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
  // kmz: (user, idata) => new Promise((resolve, reject) => {
  //   try {
  //     kmzUploadFiles(idata.file, user).then((lks) => {
  //       resolve({ m: 'loaded', r: lks });
  //     }).catch((e) => {
  //       reject({ m: e });
  //     });
  //   } catch (e) { reject({ m: e }); }
  // }),
  kml: (user, idata) => new Promise((resolve, reject) => {
    try {
      const tj = require('@tmcw/togeojson');
      const fs = require('fs');
      const { DOMParser } = require('xmldom');
      const kml = new DOMParser().parseFromString(fs.readFileSync(idata.file.path, 'utf8'));
      const convertedWithStyles = tj.kml(kml, { styles: true });
      resolve({ m: 'Loaded', r: convertedWithStyles });
    } catch (e) { reject({ m: e }); }
  }),
  kmz: (user, idata) => new Promise((resolve, reject) => {
    try {
      kmzUploadFiles(idata.file, user).then((lks) => {
        // resolve({ m: 'loaded', r: lks });
        const KMZGeoJSON = require('kmz-geojson');
        KMZGeoJSON.toGeoJSON(lks[0], async (err, geojson) => {
          geojson.features = await geojson.features.map((feature) => {
            if (typeof feature === 'object') {
              if (feature.geometry.coordinates !== undefined) {
                feature.geometry.coordinates = feature.geometry.coordinates.filter(Boolean);
                return feature;
              }
            }
          });
          geojson.features = geojson.features.filter(Boolean);
          resolve({ m: 'Loaded', r: geojson });
        });
      }).catch((e) => {
        reject({ m: e });
      });
    } catch (e) { reject({ m: e }); }
  }),
};
