let Shortener = require('./class/Shortener');

Shortener = new Shortener();
module.exports = {
  createNewUrl: (usr, url) => Shortener.createUrl(usr, url),
}
