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
  },
};
