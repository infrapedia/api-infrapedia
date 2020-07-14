let MarketPlace = require('./class/MarketPlace');

MarketPlace = new MarketPlace();
module.exports = {
  getList: () => MarketPlace.getListMarket(),
};
