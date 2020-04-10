const redis = require('redis');
const settings = require('./settings');

const redisClient = redis.createClient({
  host: settings.redis.host,
  port: settings.redis.port,
});
redisClient.auth(settings.redis.pass);
redisClient.on('connect', () => { console.log('Redis conection success'); });
const redisWork = {
  set: (title, data) => {
    redisClient.set(title, data, (err) => {
      if (err) return err;
      return null;
    });
  },
  get: (title) => {
    redisClient.get(title, (err, reply) => {
      console.log(err, reply);
      if (err) return err;
      else if (reply) return reply;
      else return null;
    });
  },
  redisClient,
};
module.exports = redisWork;
