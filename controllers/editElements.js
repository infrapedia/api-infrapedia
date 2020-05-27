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
  getElementOwner: (user, id, type) => new Promise((resolve, reject) => {
    try {
      let Elemnt;
      switch (String(type)) {
        case '1':
          Elemnt = require('./class/Cable');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([r[0].name, 'Cable']);
          }).catch((e) => {
            console.log(e);
            reject(e);
          });
          break;
        case '2':
          Elemnt = require('./class/CableLandingStation');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([r.r[0].name, 'Cable Landing Station']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '3':
          Elemnt = require('./class/Facility');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([r.r[0].name, 'Facility']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '5':
          Elemnt = require('./class/InternetExchangePoint');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([r.r[0].name, 'Internet Exchange Point']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '6':
          Elemnt = require('./class/Network');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([r.r[0].name, 'Group']);
          }).catch((e) => {
            reject(e);
          });
          break;
        case '7':
          Elemnt = require('./class/Organization');
          Elemnt = new Elemnt();
          Elemnt.getNameElemnt(id).then((r) => {
            resolve([r.r[0].name, 'Organization']);
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
          // information += await Object.keys(idata.information).map((key) => `<li>${key}: ${idata.information[key]}</li>`);
          // information += '</ul>';
          editE.insertOne({
            uuid: String(user),
            elemnt: new ObjectID(idata.element),
            t: String(idata.t),
            information: String(idata.information),
            lks,
            rgDate: luxon.DateTime.utc(),
          }, (err, i) => {
            if (err) { reject({ m: err }); }
            // Add to freshdhesk
            const sendTicket = require('./helpers/freshdesk');
            // we need to validate the data of cable

            Promise.all([module.exports.getElementOwner(user, idata.element, idata.t), module.exports.getEmail(user, token)]).then((r) => {
              let email = JSON.parse(r[1]);
              sendTicket(
                {
                  name: email.name,
                  email: email.email,
                  subject: 'A user wants to edit or add a new element',
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
          });
        }).catch((e) => { reject({ m: e }); });
      });
    } catch (e) { reject({ m: e }); }
  }),
};
