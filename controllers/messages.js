let Message = require('./class/Message');

Message = new Message();
module.exports = {
  add: (usr, data, token) => Message.add(usr, data, token),
  sents: (usr, data) => Message.sents(usr, data),
  myMessages: (usr, data) => Message.myMessages(usr, data),
  viewMessage: (usr, id, elemnt) => Message.viewMessage(usr, id, elemnt),
  deleteMyMessage: (usr, id) => Message.deleteMyMessage(usr, id),
  makeAnOffer: (usr, token, data) => Message.makeAnOffer(usr, token, data),
};
