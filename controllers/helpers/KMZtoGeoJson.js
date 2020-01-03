(function (KMZGeoJSON) {
  KMZGeoJSON.version = '0.1.0';
  KMZGeoJSON.defaults = {};
  const togeojson = require('togeojson');
  const unzip = require('unzip2');
  const fs = require('fs');
  const xmldom = new (require('xmldom').DOMParser)();
  KMZGeoJSON.toKML = function (path, callback) {
    fs.createReadStream(path)
      .pipe(unzip.Parse())
      .on('entry', (entry) => {
        const fileName = entry.path;
        const { type } = entry; // 'Directory' or 'File'
        if (fileName.indexOf('.kml') === -1) { entry.autodrain(); return; }
        let data = '';
        entry.on('error', (err) => { callback(err); });
        entry.on('data', (chunk) => { data += chunk; });
        entry.on('end', () => { callback(null, data); });
      });
  };
  KMZGeoJSON.toGeoJSON = function (path, callback) {
    KMZGeoJSON.toKML(path, (error, kml) => {
      const geojson = togeojson.kml(xmldom.parseFromString(kml));
      callback(null, geojson);
    });
  };
}(module.exports));
