const fs = require('fs');
const wget = require('node-wget');
const KMZtoGeoJson = require('./helpers/KMZtoGeoJson');

module.exports = {
  kmzToGeojson: (usr, data) => new Promise((resolve, reject) => {
    // con el enlace vamos a crear un stream de lectura
    wget({ url: data.link, dest: './temp/' }, async (error, response, body) => {
      await KMZtoGeoJson.toGeoJSON(response.filepath, (err, geoJson) => {
        if (err) reject({ m: err });
        fs.unlink(response.filepath, () => {
          resolve({ m: 'Loaded', r: geoJson });
        });
      });
    });
  }),
};
