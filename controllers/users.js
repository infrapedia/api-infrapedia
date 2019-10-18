let User = require('./class/User');

User = new User();
module.exports = {
  getProfile: (token, usr) => User.getProfile(token, usr),
  updateProfileMetaData: (token, usr, metadata) => User.updateProfileMetadata(token, usr, metadata),
  phoneNumber: (token, user, data) => User.updatePhoneNumber(token, user, data),
  updateName: (token, user, data) => User.updateName(token, user, data),
}
