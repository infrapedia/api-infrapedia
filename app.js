//Declare
require('dotenv/config')
const _path = require( 'path' );
const _express = require('express')
//Express config
let app = _express()
require('./config/setConfigExpress')( app )
module.exports = app

//routes
require( _path.join( process.cwd(), 'routes' ) )();
//Run Server
let server = app.listen( app.get( 'settings' ).port,  () => { console.log( '🏁🏁🏁 Do it!! 🏁🏁🏁 : ' + app.get( 'settings' ).port ) })
