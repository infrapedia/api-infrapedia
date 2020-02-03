const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const nanoid = require('nanoid');

class Shortener {
  constructor() {
    this.model = require('../../models/shorts.model');
  }

  createUrl(user, url) {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((shorts) => {
          shorts.findOneAndUpdate({ original_url: url }, {
            $setOnInsert: {
              uuid: user,
              urlCode: nanoid(7),
              rgDate: luxon.DateTime.utc(),
            },
          },
          {
            returnOriginal: false,
            upsert: true,
          }, (err, r) => {
            if (err) reject({ m: err });
            resolve({ m: 'New url', r: `${process.env._BASEURL}${r.value.urlCode}` });
          });
        }).catch((e) => { });
      } catch (e) { reject({ m: e }); }
    });
  }
}
module.exports = Shortener;
