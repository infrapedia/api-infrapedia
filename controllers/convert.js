const fs = require('fs');
const wget = require('node-wget');
const KMZtoGeoJson = require('./helpers/KMZtoGeoJson');

module.exports = {
  kmzToGeojsonLines: (usr, data) => new Promise((resolve, reject) => {
    // con el enlace vamos a crear un stream de lectura
    wget({ url: data.link, dest: './temp/' }, async (error, response, body) => {
      await KMZtoGeoJson.toGeoJSON(response.filepath, async (err, geoJson) => {
        if (err) reject({ m: err });
        let geoJsonFormated = { type: 'FeatureCollection', features: [] };
        await Object.keys(geoJson.features).map(async (key) => {
          if (geoJson.features[key].geometry.coordinates !== undefined) {
            if (isNaN(geoJson.features[key].geometry.coordinates[0][0]) === false && geoJson.features[key].geometry.coordinates[0][0] !== null && geoJson.features[key].geometry.coordinates[0][0] !== undefined){
              if (Array.isArray(geoJson.features[key].geometry.coordinates)) {
                geoJson.features[key].geometry.coordinates = await geoJson.features[key].geometry.coordinates.map((coordinante) => ((coordinante.length > 2 ) ? [coordinante[0], coordinante[1]] : coordinante));
                geoJson.features[key].properties = geoJson.features[key].properties = { _id: key, name: `Segment ${key}`, status: true, stroke: '#fdf72d', 'stroke-width': 1, 'stroke-opacity': 1 };
                geoJsonFormated.features.push(geoJson.features[key]);
              }
            }
          }
        });
        fs.unlink(response.filepath, async () => {
          resolve({ m: 'Loaded', r: geoJsonFormated });
        });
      });
    });
  }),
  kmzToGeojsonPoints: (usr, data) => new Promise((resolve, reject) => {
    // con el enlace vamos a crear un stream de lectura
    wget({ url: data.link, dest: './temp/' }, async (error, response, body) => {
      await KMZtoGeoJson.toGeoJSON(response.filepath, async (err, geoJson) => {
        if (err) reject({ m: err });
        // let geoJsonFormated = { type: 'FeatureCollection', features: [] };
        // await Object.keys(geoJson.features).map(async (key) => {
        //   if (geoJson.features[key].geometry.coordinates !== undefined) {
        //     if (isNaN(geoJson.features[key].geometry.coordinates[0][0]) === false && geoJson.features[key].geometry.coordinates[0][0] !== null && geoJson.features[key].geometry.coordinates[0][0] !== undefined){
        //       if (Array.isArray(geoJson.features[key].geometry.coordinates)) {
        //         geoJson.features[key].geometry.coordinates = await geoJson.features[key].geometry.coordinates.map((coordinante) => ((coordinante.length > 2 ) ? [coordinante[0], coordinante[1]] : coordinante));
        //         geoJson.features[key].properties = geoJson.features[key].properties = { _id: key, name: `Segment ${key}`, status: true, stroke: '#fdf72d', 'stroke-width': 1, 'stroke-opacity': 1 };
        //         geoJsonFormated.features.push(geoJson.features[key]);
        //       }
        //     }
        //   }
        // });
        fs.unlink(response.filepath, async () => {
          resolve({ m: 'Loaded', r: geoJson });
        });
      });
    });
  }),
};
