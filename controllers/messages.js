let Message = require('./class/Message');

Message = new Message();
module.exports = {
  add: (usr, data) => Message.add(usr, data),
  sents: (usr, data) => Message.sents(usr, data),
  myMessages: (usr, data) => Message.myMessages(usr, data),
  viewMessage: (usr, id, elemnt) => Message.viewMessage(usr, id, elemnt),
  deleteMyMessage: (usr, id) => Message.deleteMyMessage(usr, id),
}
