const luxon = require('luxon')
class Organization {
  constructor(){
    this.model = require('../../models/organization');
  }
  add( user, data ){
    console.log( data );
    return new Promise( ( resolve, reject ) =>{
      try{

          this.model().then( async ( organization ) => {
              data.address = JSON.parse( data.address );
              data = {
                uuid: String( user ),
                name: String( data.name ),
                notes: String( data.notes ),
                address: data.address,
                premium: ( data.premium === 'true' || data.premium === 'True'),
                non_peering:  ( data.non_peering === 'true' || data.non_peering === 'True'),
                rgDate: luxon.DateTime.utc(),
                uDate: luxon.DateTime.utc(),
                status: false,
              }
              organization.insertOne( data, ( err, i ) => {
                if( err ) reject( err )
                resolve('Organization created')
              } );
          } ).catch( ( e ) => {
              reject( e );
          } );
      }
      catch( e ){
        reject( e );
      }
    });
  }
}
module.exports = Organization