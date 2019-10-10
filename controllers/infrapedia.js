module.exports = {
  ping: ( req, res ) => {
    res.json( { status: 'ok' } )
  },
  pong: ( req, res ) => {
    res.json( { status: 'login' } )
  }
}