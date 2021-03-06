module.exports = {
  callEndPoints: (router, controllers, response) => {
    const statics = require('../../lib/middleware/statics');

    router.post(`${process.env._ROUTE}/auth/organization/add`, (req, res) => {
      controllers.organizations.add(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/transfer`, (req, res) => {
      controllers.organizations.transferFacilities()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    //https://www.infrapedia.com/api/auth/organization/edit
    router.put(`${process.env._ROUTE}/auth/organization/edit`, (req, res) => {
      controllers.organizations.edit(req.headers.userid, req.body)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/organization/all`, (req, res) => {
      controllers.organizations.list(req.headers.userid, req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/organization/delete/:id`, (req, res) => {
      controllers.organizations.delete(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/auth/organization/owner/:id`, (req, res) => {
      controllers.organizations.owner(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/view/:id`, statics, (req, res) => {
      controllers.organizations.view(req.headers.userid, req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/search`, statics, (req, res) => {
      controllers.organizations.search(req.headers.userid, req.query)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/partners`, (req, res) => {
      controllers.organizations.partners()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/istrusted`, (req, res) => {
      controllers.organizations.istrusted()
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/checkname`, statics, (req, res) => {
      controllers.organizations.checkName(req.query.n)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/checkpeeringdb`, statics, (req, res) => {
      controllers.organizations.checkPeeringDb(req.query.p)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/groups/:id`, (req, res) => {
      controllers.organizations.associationsGroups(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/cls/:id`, (req, res) => {
      controllers.organizations.associationsCLS(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/subseas/:id`, (req, res) => {
      controllers.organizations.associationsSubseas(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/subseas/ku/:id`, (req, res) => {
      controllers.organizations.associationsSubseasKU(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/terrestrials/:id`, (req, res) => {
      controllers.organizations.associationsTerrestrials(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/ixps/:id`, (req, res) => {
      controllers.organizations.associationsIXPS(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/facilities/ku/:id`, (req, res) => {
      controllers.organizations.associationsFacilitiesKU(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.get(`${process.env._ROUTE}/organization/facilities/:id`, (req, res) => {
      controllers.organizations.associationsFacilities(req.params.id)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); }); });

    router.delete(`${process.env._ROUTE}/auth/organization/permanentdelete/:id`, (req, res) => {
      controllers.organizations.permanentDelete(req.headers.userid, req.params.id, req.body.code)
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });

    //UPDATE ELEMENTS
    router.delete(`${process.env._ROUTE}/auth/updateknownuserFacility`, (req, res) => {
      controllers.organizations.updateKnownUserFacility(req.headers.userid, req.body.idorg, req.body.idFacility, 'delete')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/updateknownuserCable`, (req, res) => {
      controllers.organizations.updateKnownUserCable(req.headers.userid, req.body.idorg, req.body.idcable, 'delete')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/updateknownuserFacility`, (req, res) => {
      console.log(req.body);
      controllers.organizations.updateKnownUserFacility(req.headers.userid, req.body.idorg, req.body.idFacility, 'add')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/updateknownuserCable`, (req, res) => {
      controllers.organizations.updateKnownUserCable(req.headers.userid, req.body.idorg, req.body.idcable, 'add')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/updateOrganizationCable`, (req, res) => {
      controllers.organizations.updateOrganizationCable(req.headers.userid, req.body.idorg, req.body.idcable, 'delete')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/updateOrganizationCable`, (req, res) => {
      controllers.organizations.updateOrganizationCable(req.headers.userid, req.body.idorg, req.body.idcable, 'add')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/updateOrganizationCls`, (req, res) => {
      controllers.organizations.updateOrganizationCLS(req.headers.userid, req.body.idorg, req.body.idcls, 'delete')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/updateOrganizationCls`, (req, res) => {
      controllers.organizations.updateOrganizationCLS(req.headers.userid, req.body.idorg, req.body.idcls, 'add')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/updateOrganizationIXP`, (req, res) => {
      controllers.organizations.updateOrganizationIXP(req.headers.userid, req.body.idorg, req.body.idixp, 'delete')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.post(`${process.env._ROUTE}/auth/updateOrganizationIXP`, (req, res) => {
      controllers.organizations.updateOrganizationIXP(req.headers.userid, req.body.idorg, req.body.idixp, 'add')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    router.delete(`${process.env._ROUTE}/auth/updateOrganizationFacility`, (req, res) => {
      controllers.organizations.updateOrganizationFacility(req.headers.userid, req.body.idorg, req.body.idfacility, 'delete')
        .then((r) => { response.success(res, r, false); })
        .catch((e) => { response.err(res, e); });
    });
    // router.post(`${process.env._ROUTE}/auth/updateOrganizationFacility`, (req, res) => {
    //   controllers.organizations.updateOrganizationFacility(req.headers.userid, req.body.idorg, req.body.idfacility, 'add')
    //     .then((r) => { response.success(res, r, false); })
    //     .catch((e) => { response.err(res, e); });
    // });
  },
};
