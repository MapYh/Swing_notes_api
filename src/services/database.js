const Datastore = require("nedb-promises");

const dbUsers = new Datastore({ filename: `./model/users.db`, autoload: true });

function storedUser(username, password, notes) {
  dbUsers.insert({ username: username, password: password, notes: notes });
}
function getUser(username) {
  return dbUsers.findOne({ username: username });
}
function getUserWithId(id) {
  return dbUsers.findOne({ _id: id });
}

function getAllNotes() {
  return dbUsers.find({});
}

module.exports = {
  dbUsers,
  storedUser,
  getUser,
  getUserWithId,
  getAllNotes,
};
