//Declare
require('dotenv/config')
const _path = require( 'path' );
const _express = require('express')
let db = require( './config/connection' );
//Express config
let app = _express()
require('./config/setConfigExpress')( app )
module.exports = app

//routes
require( _path.join( process.cwd(), 'routes' ) )();
//Run Server
  //connect database
  db.connect( process.env._DB_DOMAIN, process.env._DB_NAME, function ( err ) { if ( err ) throw Error( err ); } );
    let server = app.listen( app.get( 'settings' ).port,  () => { console.log( '🏁🏁🏁 Do it!! 🏁🏁🏁 : ' + app.get( 'settings' ).port ) })
  db.close();