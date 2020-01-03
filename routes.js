//Declare
const path = require('path')
const glob = require('glob')
//
const app = require(path.join(process.cwd()))

// configuration
const controllers = { }
const files = glob.sync(path.join(process.cwd(), 'controllers', '**', '*.js'));
files.forEach((file) => {
  let temp = controllers
  const parts = path.relative(path.join(process.cwd(), 'controllers'), file).slice(0, -3).split(path.sep)
  while (parts.length) {
    if (parts.length === 1) temp[parts[0]] = require(file)
    else temp[parts[0]] = temp[parts[0]] || {}

    temp = temp[parts.shift()];
  }
})
module.exports = function () { require('./routes/index')(app, controllers) }