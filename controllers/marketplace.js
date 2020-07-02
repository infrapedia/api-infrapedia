let MarketPlace = require('./class/marketplace');

MarketPlace = new MarketPlace();
module.exports = {
  getList: () => MarketPlace.getListMarket(),
};
