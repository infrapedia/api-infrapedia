const util = require('util');
const url = require('url');
const querystring = require('querystring');
const axios = require('axios');
class User {
  constructor (){
    this.auth0Url = new url.URL( util.format('https://%s/v2/', process.env.AUTH0_DOMAIN) );
  }
  getProfile( token ) {
    let config = {
      headers: {'Authorization': "bearer " + token}
    };

    console.log( this.auth0Url );
    // Axios.post(
    //   'http://localhost:8000/api/v1/get_token_payloads',
    //   bodyParameters,
    //   config
    // ).then((response) => {
    //   console.log(response)
    // }).catch((error) => {
    //   console.log(error)
    // });
    // axios.get(webApiUrl, { headers: {"Authorization" : `Bearer ${tokenStr}`} });
  }
}

module.exports = User
