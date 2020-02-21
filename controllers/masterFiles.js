module.exports = {
  cables: () => {
    try {
      const cable = require('../models/cable.model');
      cable().then((cable) => {

      }).catch((e) => { return 'Error'; });
    } catch (e) { return 'Error'; }
  },
  cls: () => {
    try {
      const cls = require('../models/cls.model');
      cls().then((cls) => {

      }).catch((e) => { return 'Error'; });
    } catch (e) { return 'Error'; }
  },
  ixps: () => {
    try {
      const ixps = require('../models/ixps.model');
      ixps().then((ixps) => {

      }).catch((e) => { return 'Error'; });
    } catch (e) { return 'Error'; }
  },
  facilities: () => {
    try {
      const facility = require('../models/facility.model.model');
      facility().then((facility) => {

      }).catch((e) => { return 'Error'; });
    } catch (e) { return 'Error'; }
  },
}
