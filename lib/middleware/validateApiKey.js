const luxon = require('luxon');
const apiKey = require('../../models/apikey.model');
const redisClient = require('../../config/redis');
const fs = require('fs');

function validateKey(req, res, next) {
  if (fs.existsSync(`./apikeys/${req.query.k}.key`)) next();
  else res.sendStatus(409);
}
module.exports = validateKey;

// , domain: `${req.protocol}${req.headers.host}`
