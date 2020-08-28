const { ObjectID } = require('mongodb');
const cable = require('../../models/cable.model');
const cls = require('../../models/cls.model');
const facility = require('../../models/facility.model');
const ixp = require('../../models/ixp.model');
const network = require('../../models/network.model');
const organization = require('../../models/organization.model');
const slugToString = require('../helpers/slug');

let xml;
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
            let count = 0;
            results.map((c) => {
              cable.updateOne({ _id: new ObjectID(c._id) }, { $set: { slug: slugToString(c.name) } },
                (err, u) => { console.log(count); count += 1; });
            });
            if (count === results.length) resolve();
          });
        }).catch((e) => {

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
            let count = 0;
            results.map((c) => {
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
            let count = 0;
            results.map((c) => {
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
            let count = 0;
            results.map((c) => {
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
              _id: 1, name: 1, slug: 1, rgDate: 1, terrestial: 1
            },
          },
          { $match: { deleted: { $ne: true } } },
          { $addFields: { rgDate: { $dateToString: { date: '$rgDate', format: '%Y-%m-%d', timezone: 'America/Los_Angeles' } } } },
        ])
          .toArray(async (err, elements) => {
            if (elements.length > 0) {
              await elements.map((el) => {
                const slug = (el.terrestrial) ? 'terrestrial-network' : 'subsea-cable';
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/${slug}/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
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
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/cls/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
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
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/facility/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
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
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/ixp/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
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
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/network/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createOrganizations() {
    return new Promise((resolve, reject) => {
      console.log('starting with organizations');
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
            if (elements.length > 0) {
              await elements.map((el) => {
                xml.ele('url')
                  .ele('loc', `${process.env._CORSURL}/organization/${el.slug}`).up()
                  .ele('lastmod', `${el.rgDate}`)
                  .up()
                  .ele('changefreq', 'monthly')
                  .up()
                  .ele('priority', '0.4')
                  .up();
              });
              resolve();
            }
          });
      }).catch((e) => console.log(e));
    });
  }

  createSiteMapXML() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise((resolve, reject) => {
      try {
        console.log('starting');
        const builder = require('xmlbuilder');
        const fs = require('fs');
        const dirPath = 'sitemap.xml';
        xml = builder.create('urlset');
        xml.ele('url')
          .ele('loc', `${process.env._CORSURL}/cable/`).up()
          .ele('lastmod', '')
          .up()
          .ele('changefreq', 'monthly')
          .up()
          .ele('priority', '0.4')
          .up();

        // const xmldoc = xml.toString({ pretty: true });
        // fs.writeFileSync(dirPath, xmldoc, (err) => {
        //   if (err) { return console.log(err); }
        //   resolve();
        // });
        Promise.all([
          this.createCables(),
          ]).then((r) => {
            /*
            this.createCls(),
          this.createFacilities(),
          this.createIXPS(),
          this.createNetwork(),
          this.createOrganizations()
             */
          console.log('writing xml file');
          const xmldoc = xml.toString({ pretty: true });
          fs.writeFileSync(dirPath, xmldoc, (err) => {
            if (err) { return console.log(err); }
            resolve();
          });
        }).catch((e) => {
          console.log(e);
        });
      } catch (e) {
        console.log(e);
      }
    });
  }
}
module.exports = SEO;
