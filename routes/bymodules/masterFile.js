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
    router.get(`${process.env._ROUTE}/masterfile/facilitiespoints`, (req, res) => {
      controllers.masterFiles.facilitiesPoints();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/cls`, (req, res) => {
      controllers.masterFiles.cls();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/terrestrial`, (req, res) => {
      controllers.masterFiles.terrestrial();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/subsea`, (req, res) => {
      controllers.masterFiles.subseaCables();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/cables`, (req, res) => {
      controllers.masterFiles.cables();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/vcables`, (req, res) => {
      controllers.masterFiles.validateCables();
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/ccable`, (req, res) => {
      controllers.masterFiles.createUniqueFile(req.query.id);
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/createcableslayer`, (req, res) => {
      controllers.masterFiles.buildMasterFile('cables');
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/createsubsealayer`, (req, res) => {
      controllers.masterFiles.buildMasterFile('subsea');
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
    router.get(`${process.env._ROUTE}/masterfile/createterrestriallayer`, (req, res) => {
      controllers.masterFiles.buildMasterFile('terrestrial');
      res.status(200).json({ t: 'success', data: { m: 'The master file is in the process of creation, we will notify you when it is completely ready' } });
    });
  },
};
