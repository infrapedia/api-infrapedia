const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { adms } = require('../helpers/adms');
const apikey = require('../../models/apikey.model');
const redisClient = require('../../config/redis');

class apiService {
  checkKey(user, domain) {
    return new Promise((resolve, reject) => {
      try {
        bcrypt.hash(`${user}${domain}${process.env.myPP}`, Number(process.env.saltRoundsAPIKey), (err, hash) => {
          if (err) { reject({ m: err }); }
          apikey().then((apikey) => {
            apikey.findOneAndUpdate({ uuid: user }, { $set: { key: hash, domain } }, async (err, u) => {
              if (u.lastErrorObject.updatedExisting) {
                if (fs.existsSync(`./apikeys/${u.value.key}.key`)){
                  await fs.unlinkSync(`./apikeys/${u.value.key}.key`, async (err, v) => {
                    if (err) reject({ m: 'API key not created' });
                  });
                }
                await fs.createWriteStream(`./apikeys/${hash}.key`);
                resolve({ m: 'Api key updated correctly' });
              } else {
                apikey.insertOne({ uuid: user, key: hash, domain }, async (err, i) => {
                  if (i.insertedCount === 1) {
                    await fs.createWriteStream(`./apikeys/${hash}.key`);
                    resolve({ m: 'Api key created correctly' });
                  }
                });
              }
            });
          }).catch((e) => {
            reject({ m: e });
          });
        });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = apiService;
