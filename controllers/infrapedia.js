module.exports = {
  ping: (req, res) => { res.json({ status: 'pong' }); },
  pong: (req, res) => { res.json({ status: 'login' }); },
};
