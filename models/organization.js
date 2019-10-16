var db = require( '../config/connection.js' );
module.exports = function () {
  return new Promise( ( resolve, reject ) => {
    db.get().createCollection( 'organizations'
      ,
      {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: [ 'uuid' ],
            properties: {
              uuid: { bsonType: 'string' },
              name: { bsonType: 'string' },
              notes: { bsonType: 'string' },
              address: {
                bsonType: [ 'array' ],
                items: {
                    properties: {
                        _id: {
                            bsonType: 'objectId',
                        },
                        address: { bsonType: 'string'},
                        point: { bsonType: 'object' }
                    }
                }
              },
              premium: { bsonType: 'bool' },
              non_peering: { bsonType: 'bool' },
              rgDate: { bsonType: 'date' },
              uDate: { bsonType: 'date' },
              status: { bsonType: 'bool' }
            }
          }
        },
        validationLevel: 'off',
        validationAction: 'warn'
      }
    ).then( function ( organization ) {
      resolve( organization );
    } ).catch( function ( err ) {
      console.log( err );
      reject( err );
    } );
  } );
};