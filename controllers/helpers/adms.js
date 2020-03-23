module.exports.adms = function (id){
  if (!process.env.ADMS.includes(id)) { return { uuid: id }; } return {};
};
