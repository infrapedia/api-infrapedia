var User = require('./class/User');
User = new User();
module.exports = {
  hello: ( name ) => {
    return new Promise( ( resolve, reject ) => {
      console.log( name );
      resolve( name );
    } );
  },
  getProfile: ( token ) => User.getProfile( token)
}