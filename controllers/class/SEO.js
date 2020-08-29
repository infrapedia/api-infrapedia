const { ObjectID } = require('mongodb');
const builder = require('xmlbuilder');
const fs = require('fs');
const cable = require('../../models/cable.model');
const cls = require('../../models/cls.model');
const facility = require('../../models/facility.model');
const ixp = require('../../models/ixp.model');
const network = require('../../models/network.model');
const organization = require('../../models/organization.model');
const slugToString = require('../helpers/slug');
// SEO
const wget = require('node-wget');
const urlencode = require('urlencode');

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
                if (!fs.existsSync(`public/mapimages/cable-${slugToString(c.name)}.jpg`)) {
                  ElementClass.getMultiElementsGeom([c._id]).then((r) => {
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/600x300@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/cable-${slugToString(c.name)}.jpg` }, (error, response, body)=>{
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
              },
            },
          ]).toArray((err, results) => {
            if (err) reject({ m: err });
            let ElementClass = require('./CableLandingStation');
            ElementClass = new ElementClass();
            let count = 0;
            results.map((c) => {
              try {
                if (!fs.existsSync(`public/mapimages/cls-${slugToString(c.name)}.jpg`)) {
                  ElementClass.getMultiElementsGeom([c._id]).then((r) => {
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/600x300@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/cls-${slugToString(c.name)}.jpg` }, (error, response, body)=>{
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
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/600x300@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/facility-${slugToString(c.name)}.jpg` }, (error, response, body)=>{
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
                    wget({ url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(${urlencode(JSON.stringify(r.r))})/auto/600x300@2x?access_token=${process.env.MAPBOX}`, dest: `public/mapimages/ixp-${slugToString(c.name)}.jpg` }, (error, response, body)=>{
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

  createCables() {
    return new Promise((resolve, reject) => {
      console.log('starting with cables');
      cable().then((cable) => {
        cable.aggregate([
          {
            $project: {
              _id: 1, name: 1, slug: 1, rgDate: 1, terrestial: 1,
            },
          },
          { $match: { deleted: { $ne: true } } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'cables.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            });
            xml.ele('url');
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/app/cable/${el.slug}`).up()
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
            const dirPath = 'cls.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            });
            xml.ele('url');
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/app/cls/${el.slug}`).up()
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
            const dirPath = 'facilities.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            });
            xml.ele('url');
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/app/facilities/${el.slug}`).up()
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
            const dirPath = 'ixps.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            });
            xml.ele('url');
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/app/ixps/${el.slug}`).up()
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

  createNetwork() {
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
            const dirPath = 'networks.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            });
            xml.ele('url');
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/app/network/${el.slug}`).up()
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
              _id: 1, name: 1, slug: 1, rgDate: 1,
            },
          },
          { $match: { deleted: { $ne: true } } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            const dirPath = 'organizations.xml';
            let xml;
            xml = builder.create('urlset', {
              version: '1.0',
              encoding: 'UTF-8',
            });
            xml.ele('url');
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/app/organization/${el.slug}`).up()
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
        this.createCables().then(() => {
          this.createCls().then(() => {
            this.createFacilities().then(() => {
              this.createIXPS().then(() => {
                this.createNetwork().then(() => {
                  this.createOrganizations().then(() => {
                    const obj = {
                      sitemapindex: {
                        '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9', // attributes start with @
                      },
                    };
                    const dirPath = 'sitemap.xml';
                    let xml;
                    xml = builder.create(obj, {
                      version: '1.0',
                      encoding: 'UTF-8',
                    });
                    xml.ele('sitemap')
                      .ele('loc', `${process.env._CORSURL}/company.xml`).up()
                      .ele('lastmod', new Date(fs.statSync('company.xml').mtime).toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', 'https://blog.infrapedia.com/sitemap.xml').up()
                      .ele('lastmod', new Date().toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', `${process.env._CORSURL}/organizations.xml`).up()
                      .ele('lastmod', new Date(fs.statSync('organizations.xml').mtime).toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', 'https://blog.infrapedia.com/sitemap.xml').up()
                      .ele('lastmod', new Date().toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', `${process.env._CORSURL}/networks.xml`).up()
                      .ele('lastmod', new Date(fs.statSync('networks.xml').mtime).toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', `${process.env._CORSURL}/cables.xml`).up()
                      .ele('lastmod', new Date(fs.statSync('cables.xml').mtime).toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', `${process.env._CORSURL}/facilities.xml`).up()
                      .ele('lastmod', new Date(fs.statSync('facilities.xml').mtime).toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', `${process.env._CORSURL}/ixps.xml`).up()
                      .ele('lastmod', new Date(fs.statSync('ixps.xml').mtime).toLocaleString())
                      .up();
                    xml.ele('sitemap')
                      .ele('loc', `${process.env._CORSURL}/cls.xml`).up()
                      .ele('lastmod', new Date(fs.statSync('cls.xml').mtime).toLocaleString())
                      .up();
                    fs.writeFileSync(dirPath, xml.end().toString({ pretty: true }), (err) => {
                      if (err) { return console.log(err); }
                    });
                    resolve();
                  }).catch((e) => reject({m: e}));
                }).catch((e) => reject({m: e}));
              }).catch((e) => reject({m: e}));
            }).catch((e) => reject({m: e}));
          }).catch((e) => reject({m: e}));
        }).catch((e) => reject({m: e}));
      } catch (e) {
        reject({m: e})
      }
    });
  }
}
module.exports = SEO;
