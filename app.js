require('newrelic');
// Declare
require('dotenv/config');
const path = require('path');
const express = require('express');
const db = require('./config/connection');
// Run Server
// Express config
const app = express();
require('./config/setConfigExpress')(app);

module.exports = app;

// routes
require(path.join(process.cwd(), 'routes'))();

// connect database
db.connect(app.get('settings').mongodb.domain, app.get('settings').mongodb.name, (err) => { if (err) throw Error(err); });
app.listen(app.get('settings').port, () => { console.log(`🏁🏁🏁 Do it!! 🏁🏁🏁 : ${app.get('settings').port}`); })
db.close();
