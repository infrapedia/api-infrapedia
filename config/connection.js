const { MongoClient } = require('mongodb');
const fs = require('fs');

let state = { db: null };

module.exports = {
  // eslint-disable-next-line consistent-return
  connect: (url, dbasename, done) => {
    if (state.db) return done()
    // const ca = fs.readFileSync(`${__dirname}/certs/mongoIBM.pem`);
    MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // connectTimeoutMS: 10000,
      // auto_reconnect: true,
      // native_parser: true,
      // // sslValidate: true,
      // // sslCA: ca,
    }, (err, db) => {
      if (err) throw err
      else state.db = db.db(dbasename); return done();
    });
  },
  runCommand: () => state.db.command({ dbStats: 1 }),
  get: () => state.db,
  // eslint-disable-next-line consistent-return
  close: (done) => {
    if (state.db) {
      state.db.close((err, result) => { state = { db: null, mode: null }; return done(result); });
    } else return false;
  },
};
