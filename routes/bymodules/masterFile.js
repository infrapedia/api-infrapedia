module.exports = {
  callEndPoints: (router, controllers, response) => {
    router.get(`${process.env._ROUTE}/masterfile/ixps`, (req, res) => {
      controllers.masterFiles.ixps();
      res.send('I');
    });
    router.get(`${process.env._ROUTE}/masterfile/facilities`, (req, res) => {
      controllers.masterFiles.facilities();
      res.send('I');
    });
    router.get(`${process.env._ROUTE}/masterfile/cls`, (req, res) => {
      controllers.masterFiles.cls();
      res.send('I');
    });
    router.get(`${process.env._ROUTE}/masterfile/cablesterrestrial`, (req, res) => {
      controllers.masterFiles.cablesT();
      res.send('I');
    });
    router.get(`${process.env._ROUTE}/masterfile/cablessubsea`, (req, res) => {
      controllers.masterFiles.cablesS();
      res.send('I');
    });
  },
};
