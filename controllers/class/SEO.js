const { ObjectID } = require('mongodb');
const builder = require('xmlbuilder');
const fs = require('fs');
const wget = require('node-wget');
const urlencode = require('urlencode');
const cable = require('../../models/cable.model');
const cls = require('../../models/cls.model');
const facility = require('../../models/facility.model');
const ixp = require('../../models/ixp.model');
const network = require('../../models/network.model');
const organization = require('../../models/organization.model');
const slugToString = require('../helpers/slug');
// SEO

class SEO {
  cablesSlug() {
    return new Promise((resolve, reject) => {
      try {
        cable().then((cable) => {
          cable.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ]).toArray((err, results) => {
            if (err) reject({ m: err });
            let ElementClass = require('./Cable');
            ElementClass = new ElementClass();
            let count = 0;
            results.map((c) => {
              try {
                if (!fs.existsSync(`public/mapimages/${(c.terrestrial) ? 'terrestrial-network' : 'subsea-cable'}-${slugToString(c.name)}.jpg`)) {
                  ElementClass.getMultiElementsGeom([c._id]).then((r) => {
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/1200x630@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/${(c.terrestrial) ? 'terrestrial-network' : 'subsea-cable'}-${slugToString(c.name)}.jpg` }, (error, response, body) => {
                      if (error) {
                        console.log('--- error:');
                        console.log(error); // error encountered
                      } else {
                        console.log('--- Everything is ok:');
                      }
                    });
                  });
                }
              } catch (err) {
                console.error(err);
              }
              cable.updateOne({ _id: new ObjectID(c._id) }, { $set: { slug: slugToString(c.name) } },
                (err, u) => { console.log(count); count += 1; });
            });
            if (count === results.length) resolve();
          });
        }).catch((e) => {
          reject(e);
        });
      } catch (e) { reject({ m: e }); }
    });
  }

  clsSlug() {
    return new Promise((resolve, reject) => {
      try {
        cls().then((cls) => {
          cls.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
                terrestrial: 1,
              },
            },
          ]).toArray((err, results) => {
            if (err) reject({ m: err });
            let ElementClass = require('./CableLandingStation');
            ElementClass = new ElementClass();
            let count = 0;
            results.map((c) => {
              try {
                if (!fs.existsSync(`public/mapimages/${cls}-${slugToString(c.name)}.jpg`)) {
                  ElementClass.getMultiElementsGeom([c._id]).then((r) => {
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/1200x630@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/cls-${slugToString(c.name)}.jpg` }, (error, response, body) => {
                      if (error) {
                        console.log('--- error:');
                        console.log(error); // error encountered
                      } else {
                        console.log('--- Everything is ok:');
                      }
                    });
                  });
                }
              } catch (err) {
                console.error(err);
              }
              cls.updateOne({ _id: new ObjectID(c._id) }, { $set: { slug: slugToString(c.name) } },
                (err, u) => { console.log(count); count += 1; });
            });
            if (count === results.length) resolve();
          });
        }).catch((e) => {

        });
      } catch (e) { reject({ m: e }); }
    });
  }

  facilitiesSlug() {
    return new Promise((resolve, reject) => {
      try {
        facility().then((facility) => {
          facility.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ]).toArray((err, results) => {
            if (err) reject({ m: err });
            let ElementClass = require('./Facility');
            ElementClass = new ElementClass();
            let count = 0;
            results.map((c) => {
              try {
                if (!fs.existsSync(`public/mapimages/facility-${slugToString(c.name)}.jpg`)) {
                  ElementClass.getMultiElementsGeomPoints([c._id]).then((r) => {
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/1200x630@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/facility-${slugToString(c.name)}.jpg` }, (error, response, body) => {
                      if (error) {
                        console.log('--- error:');
                        console.log(error); // error encountered
                      } else {
                        console.log('--- Everything is ok:');
                      }
                    });
                  });
                }
              } catch (err) {
                console.error(err);
              }
              facility.updateOne({ _id: new ObjectID(c._id) }, { $set: { slug: slugToString(c.name) } },
                (err, u) => { console.log(count); count += 1; });
            });
            if (count === results.length) resolve();
          });
        }).catch((e) => {

        });
      } catch (e) { reject({ m: e }); }
    });
  }

  ixpsSlug() {
    return new Promise((resolve, reject) => {
      try {
        ixp().then((ixp) => {
          ixp.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ]).toArray((err, results) => {
            if (err) reject({ m: err });
            let ElementClass = require('./InternetExchangePoint');
            ElementClass = new ElementClass();
            let count = 0;
            results.map((c) => {
              try {
                if (!fs.existsSync(`public/mapimages/ixp-${slugToString(c.name)}.jpg`)) {
                  ElementClass.getMultiElementsGeom([c._id]).then((r) => {
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/1200x630@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/ixp-${slugToString(c.name)}.jpg` }, (error, response, body) => {
                      if (error) {
                        console.log('--- error:');
                        console.log(error); // error encountered
                      } else {
                        console.log('--- Everything is ok:');
                      }
                    });
                  });
                }
              } catch (err) {
                console.error(err);
              }
              ixp.updateOne({ _id: new ObjectID(c._id) }, { $set: { slug: slugToString(c.name) } },
                (err, u) => { console.log(count); count += 1; });
            });
            if (count === results.length) resolve();
          });
        }).catch((e) => {

        });
      } catch (e) { reject({ m: e }); }
    });
  }

  networksSlug() {
    return new Promise((resolve, reject) => {
      try {
        network().then((network) => {
          network.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ]).toArray((err, results) => {
            if (err) reject({ m: err });
            let count = 0;
            results.map((c) => {
              network.updateOne({ _id: new ObjectID(c._id) }, { $set: { slug: slugToString(c.name) } },
                (err, u) => { console.log(count); count += 1; });
            });
            if (count === results.length) resolve();
          });
        }).catch((e) => {

        });
      } catch (e) { reject({ m: e }); }
    });
  }

  organizationsSlug() {
    return new Promise((resolve, reject) => {
      try {
        organization().then((organization) => {
          organization.aggregate([
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ]).toArray((err, results) => {
            if (err) reject({ m: err });
            let count = 0;
            results.map((c) => {
              organization.updateOne({ _id: new ObjectID(c._id) }, { $set: { slug: slugToString(c.name) } },
                (err, u) => { console.log(count); count += 1; });
            });
            if (count === results.length) resolve();
          });
        }).catch((e) => {

        });
      } catch (e) { reject({ m: e }); }
    });
  }

  createSlugs() {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.cablesSlug(),
        this.clsSlug(),
        this.facilitiesSlug(),
        this.ixpsSlug(),
        this.organizationsSlug(),
        this.networksSlug(),
      ])
        .then((r) => resolve()).catch((e) => reject());
    });
  }

  terrestrialNetworks() {
    return new Promise((resolve, reject) => {
      console.log('starting with cables-terrestrialNetworks');
      cable().then((cable) => {
        cable.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1, terrestrial: 1,
            },
          },
          { $match: { $and: [{ deleted: { $ne: true } }, { terrestrial: true }] } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'seo/terrestrialnetworks.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            }).att({ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._SEOURL}/${(el.terrestrial) ? 'terrestrial-network' : 'subsea-cable'}/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  subseaCables() {
    return new Promise((resolve, reject) => {
      console.log('starting with cables-SubseaCables');
      cable().then((cable) => {
        cable.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1, terrestrial: 1,
            },
          },
          { $match: { $and: [{ deleted: { $ne: true } }, { terrestrial: false }] } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'seo/subseacables.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            }).att({ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            // xml.prev('urlset',{ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._SEOURL}/${(el.terrestrial) ? 'terrestrial-network' : 'subsea-cable'}/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createCls() {
    return new Promise((resolve, reject) => {
      console.log('starting with cls');
      cls().then((cls) => {
        cls.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1,
            },
          },
          { $match: { deleted: { $ne: true } } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'seo/cls.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            }).att({ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._SEOURL}/cls/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createFacilities() {
    return new Promise((resolve, reject) => {
      console.log('starting with facilities');
      facility().then((facility) => {
        facility.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1,
            },
          },
          { $match: { deleted: { $ne: true } } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'seo/facilities.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            }).att({ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._SEOURL}/facility/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createIXPS() {
    return new Promise((resolve, reject) => {
      console.log('starting with ixps');
      ixp().then((ixp) => {
        ixp.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1,
            },
          },
          { $match: { deleted: { $ne: true } } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'seo/ixps.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            }).att({ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._SEOURL}/ixp/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createGroup() {
    return new Promise((resolve, reject) => {
      console.log('starting with networks');
      network().then((network) => {
        network.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1,
            },
          },
          { $match: { deleted: { $ne: true } } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'seo/groups.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            }).att({ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._SEOURL}/group/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            } else {
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createOrganizations() {
    return new Promise((resolve, reject) => {
      organization().then((organization) => {
        organization.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1, one: 1,
            },
          },
          { $match: { $and: [{ name: { $exists: true } }, { deleted: { $ne: true } }, { one: { $exists: false } } ] } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'seo/organizations.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            }).att({ xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._SEOURL}/organization/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              const xmldoc = xml.end().toString({ pretty: true });
              fs.writeFileSync(dirPath, xmldoc, (err) => {
                if (err) { return console.log(err); }
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createSiteMapXMLPrincipal() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise((resolve, reject) => {
      try {
        this.subseaCables().then(() => {
          this.terrestrialNetworks().then(() => {
            this.createCls().then(() => {
              this.createFacilities().then(() => {
                this.createIXPS().then(() => {
                  this.createGroup().then(() => {
                    this.createOrganizations().then(() => {
                      const obj = {
                        sitemapindex: {
                          '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9', // attributes start with @
                        },
                      };
                      const dirPath = 'seo/sitemap.xml';
                      let xml;
                      xml = builder.create(obj, {
                        version: '1.0',
                        encoding: 'UTF-8',
                      });
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/company.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('company.xml').mtime).toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', 'https://www.infrapedia.com/blog/sitemap.xml').up()
                        .ele('lastmod', new Date().toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/organizations.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('seo/organizations.xml').mtime).toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/groups.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('seo/groups.xml').mtime).toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/subseacables.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('seo/subseacables.xml').mtime).toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/terrestrialnetworks.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('seo/terrestrialnetworks.xml').mtime).toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/facilities.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('seo/facilities.xml').mtime).toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/ixps.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('seo/ixps.xml').mtime).toISOString())
                        .up();
                      xml.ele('sitemap')
                        .ele('loc', `${process.env._SEOURL}/cls.xml`).up()
                        .ele('lastmod', new Date(fs.statSync('seo/cls.xml').mtime).toISOString())
                        .up();
                      fs.writeFileSync(dirPath, xml.end().toString({ pretty: true }), (err) => {
                        if (err) { return console.log(err); }
                      });
                      resolve();
                    }).catch((e) => reject({ m: e }));
                  }).catch((e) => reject({ m: e }));
                }).catch((e) => reject({ m: e }));
              }).catch((e) => reject({ m: e }));
            }).catch((e) => reject({ m: e }));
          }).catch((e) => reject({ m: e }));
        }).catch((e) => reject({ m: e }));
      } catch (e) {
        reject({ m: e });
      }
    });
  }
}
module.exports = SEO;
