const luxon = require('luxon');
const { adms } = require('../helpers/adms');

class MarketPlace {
  constructor() { this.model = require('../../models/messages.model'); }

  getListMarket() {
    return new Promise((resolve, reject) => {
      try {
        this.model().then((marketPlace) => {
          marketPlace.aggregate([
            {
              $match: {
                $and: [{ uuid: { $ne: 'undefined' } }, { hideMarket: { $ne: true } }],
              },
            },
            {
              $sort: { _id: -1 },
            },
          ], { allowDiskUse: true }).toArray(async (err, r) => {
            if (err) reject({ m: err });
            const data = (Array.isArray(r)) ? await r.map((elemnt) => {
              elemnt.message = elemnt.message.replace(elemnt.email, ' ------- ');
              elemnt.message = elemnt.message.replace(elemnt.uuid, ' ------- ');
              return { message: elemnt.message, rgDate: elemnt.rgDate, status: (!elemnt.status) };
            }) : [];
            // console.log(data);
            resolve({ m: '', r: data });
          });
        }).catch((e) => console.log(e)); // reject({ m: e })
      } catch (e) { console.log(e); }
    });
  }
}
module.exports = MarketPlace;
