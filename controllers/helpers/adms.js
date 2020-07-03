module.exports.adms = function (id) {
  if (process.env.ADMS.split(',').indexOf(id) === 1) { return { }; }
  return { $and: [{ uuid: id }, { deleted: { $ne: true } }] };
};
