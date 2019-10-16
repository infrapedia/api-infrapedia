let Organization = require("./class/Organization")
Organization = new Organization()
module.exports = {
  add: ( usr, data ) => Organization.add( usr, data )
}