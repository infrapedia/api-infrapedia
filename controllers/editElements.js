const luxon = require('luxon');
const { ObjectID } = require('mongodb');
const u = require('./helpers/gcloudStorage');

module.exports = {
  getEmail: (user, token) => new Promise((resolve, reject) => {
    try {
      const request = require('request');
      const options = {
        method: 'GET',
        url: `https://infrapedia.auth0.com/api/v2/users/${user}?fields=name,email,email_verified`,
        headers: {
          'content-type': 'application/json',
          Authorization: token,
        },
      };
      request(options, (error, response, body) => {
        if (error || body.hasOwnProperty('statusCode')) reject(`Error:${error}`);
        resolve(body);
      });
    } catch (e) { console.log(e); reject(e); }
  }),
  getElementName: (user, id, type) => new Promise((resolve, reject) => {
    try {
      let Elemnt;
      switch (String(type)) {
        case '1':
          Elemnt = require('./class/Cable');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([(r !== []) ? r[0].name : '', 'Cable']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '2':
          Elemnt = require('./class/CableLandingStation');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([(r !== []) ? r[0].name : '', 'Cable Landing Station']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '3':
          Elemnt = require('./class/Facility');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([(r !== []) ? r[0].name : '', 'Facility']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '4':
          Elemnt = require('./class/InternetExchangePoint');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([(r !== []) ? r[0].name : '', 'Internet Exchange Point']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '6':
          Elemnt = require('./class/Network');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([(r !== []) ? r[0].name : '', 'Group']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '7':
          Elemnt = require('./class/Organization');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([(r !== []) ? r[0].name : '', 'Organization']);
          }).catch((e) => {
            reject(e);
          });
          break;
        default: reject('Default');
      }
    } catch (e) { console.log(e); reject(e); }
  }),
  uploadInformation: (user, idata, token) => new Promise((resolve, reject) => {
    try {
      const editElements = require('../models/editElements.model');
      u.uploadElementsFile(idata.file, user).then((lks) => {
        editElements().then(async (editE) => {
          // let information = '<ul>';
          // eslint-disable-next-line max-len
          // information += await Object.keys(idata.information).map((key) => `<li>${key}: ${idata.information[key]}</li>`);
          // information += '</ul>';
          editE.insertOne({
            uuid: String(user),
            elemnt: (idata.element !== undefined && idata.element !== '' && idata.element !== 'undefined') ? new ObjectID(idata.element) : '',
            t: String(idata.t),
            information: String(idata.information),
            lks,
            rgDate: luxon.DateTime.utc(),
          }, (err, i) => {
            if (err) { reject({ m: err }); }
            // Add to freshdhesk
            const sendTicket = require('./helpers/freshdesk');
            // we need to validate the data of cable

            if (idata.element !== undefined && idata.element !== '' && idata.element !== 'undefined') {
              Promise.all([module.exports.getElementName(user, idata.element, idata.t), module.exports.getEmail(user, token)]).then((r) => {
                const email = JSON.parse(r[1]);
                sendTicket(
                  {
                    name: email.name,
                    email: email.email,
                    subject: `A user wants to edit ${r[0][0]}-${r[0][1]} `,
                    description: `${idata.information} \n ${lks}`,
                    status: 2,
                    priority: 3,
                  },
                ).then(() => {
                  resolve({ m: 'Thank you for helping us build a better service for you.' });
                }).catch((e) => {
                  reject({ m: e });
                });
              }).catch((e) => {
                reject({ m: e });
              });
            } else {
              module.exports.getEmail(user, token).then((r) => {
                const email = JSON.parse(r);
                let type = '';
                switch (String(idata.t)) {
                  case '1': type = 'cable'; break;
                  case '2': type = 'Cable Landing Station'; break;
                  case '3': type = 'facility'; break;
                  case '4': type = 'Internet Exchange Point'; break;
                  case '6': type = 'Group'; break;
                  case '7': type = 'Organization'; break;
                  default: type = 'element';
                }
                sendTicket(
                  {
                    name: email.name,
                    email: email.email,
                    subject: `A user wants to add a new ${type}`,
                    description: `${idata.information} \n ${lks}`,
                    status: 2,
                    priority: 3,
                  },
                ).then(() => {
                  resolve({ m: 'Thank you for helping us build a better service for you.' });
                }).catch((e) => {
                  reject({ m: e });
                });
              });
            }
          });
        }).catch((e) => { reject({ m: e }); });
      }).catch((e) => { reject({ m: e }); });
    } catch (e) { reject({ m: e }); }
  }),
};
