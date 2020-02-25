const MBTiles = require('@mapbox/mbtiles');
const q = require('d3-queue').queue();
const objectAssign = require('object-assign');
const utils = require('./wms_util');

module.exports = {
  loadTiles(file, callback) {
    new MBTiles(file, ((err, tiles) => {
      if (err) throw err;
      tiles.getInfo((err, info) => {
        if (err) throw err;

        const tileset = objectAssign({}, info, {
          tiles,
        });

        callback(null, tileset);
      });
    }));
  },
  serve(router, response, config, callback) {
    const { loadTiles } = this;
    const { listen } = this;

    config.mbtiles.forEach((file) => {
      q.defer(loadTiles, file);
    });

    q.awaitAll((error, tilesets) => {
      if (error) throw error;
      const finalConfig = utils.mergeConfigurations(config, tilesets);
      listen(router, response, finalConfig, callback);
    });
  },
  listen(router, response, config) {
    // eslint-disable-next-line no-underscore-dangle
    const { format } = config.tiles._info;
    router.get(`${process.env._ROUTE}/:source/:z/:x/:y.${format}`, (req, res) => {
      const p = req.params;
      p.source += '.mbtiles'
      const { tiles } = config.sources[p.source];
      tiles.getTile(p.z, p.x, p.y, (err, tile, headers) => {
        if (err) {
          res.end();
        } else {
          res.writeHead(200, headers);
          res.end(tile);
        }
      });
    });
  },
};
