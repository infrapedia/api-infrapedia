const MongoClient = require( 'mongodb' );
const fs = require('fs');
var state = { db: null };

module.exports = {
  connect: function ( url, dbasename, done ){
    if ( state.db ) return done()
    let ca = fs.readFileSync(__dirname + "/certs/mongoIBM.pem");
    MongoClient.connect( url, {
      useNewUrlParser: true,
      connectTimeoutMS: 10000,
      auto_reconnect: true,
      native_parser:true,
      sslValidate:true,
      sslCA:ca
    }, function ( err, db ) {
      if ( err )  throw err
      else  state.db = db.db( dbasename ); return done()
    } );
  },
  runCommand: () => { return state.db.command( { dbStats: 1 }) },
  get: () => state.db ,
  close: ( done ) => {
    if ( state.db ) state.db.close( ( err, result ) => { state = { db: null, mode: null }; return done( result ) } );
    else return false
  }
};