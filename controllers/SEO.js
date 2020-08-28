let SEO = require('./class/SEO');

SEO = new SEO();
module.exports = {
  createSlugs: () => SEO.createSlugs(),
  createSitemap: () => SEO.createSiteMapXML(),
};
