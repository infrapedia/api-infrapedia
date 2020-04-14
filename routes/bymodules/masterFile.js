module.exports = {
  callEndPoints: (router, controllers, response) => {
    router.get(`${process.env._ROUTE}/masterfile/ixps`, (req, res) => {
      controllers.masterFiles.ixps();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/facilities`, (req, res) => {
      controllers.masterFiles.facilities();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/cls`, (req, res) => {
      controllers.masterFiles.cls();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/cablesterrestrial`, (req, res) => {
      controllers.masterFiles.cablesT();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/cablessubsea`, (req, res) => {
      controllers.masterFiles.cablesS();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/cables`, (req, res) => {
      controllers.masterFiles.cables();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
  },
};
