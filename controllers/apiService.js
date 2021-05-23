const redisClient = require('../config/redis');

let apiService = require('./class/apiService');

// eslint-disable-next-line new-cap
apiService = new apiService();

module.exports = {
  checkKey: (usr, domain) => apiService.checkKey(usr, domain),
};
