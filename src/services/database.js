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

async function getAllNotes(id) {
  const user = await dbUsers.findOne({ _id: id }, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log(docs);
      return docs;
    }
  });
  return user.notes;
}

async function updateNotes(id, updatedInfo) {
  const user = await dbUsers.findOne({ _id: id }, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log("docs", docs);
      return docs;
    }
  });

  //Letar efter en anteckning med samma id som in req.
  for (let i = 0; i < user.notes.length; i++) {
    if (user.notes[i].id == updatedInfo.id) {
      //Updaterar innheållet i anteckningen med det som finns i req.
      user.notes[i].text = updatedInfo.text;
      user.notes[i].title = updatedInfo.title;
      user.notes[i].modifiedAt = updatedInfo.modifiedAt;
    }
  }
  const notes = user.notes;
  await dbUsers.update({ _id: id }, { $set: { notes } });

  //Returnerar alla anteckningar
  return notes;
}

async function deleteNote(id, idToDelete) {
  const user = await dbUsers.findOne({ _id: id }, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      return docs;
    }
  });

  for (let i = 0; i < user.notes.length; i++) {
    if (user.notes[i].id == idToDelete.id) {
      user.notes.splice(i, 1);
    }
  }
  const notes = user.notes;
  await dbUsers.update({ _id: id }, { $set: { notes } });
}

async function search(id, title) {
  let searchedNote;
  const user = await dbUsers.findOne({ _id: id }, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log("docs", docs);
      return docs;
    }
  });

  for (let i = 0; i < user.notes.length; i++) {
    if (user.notes[i].title == title) {
      searchedNote = user.notes[i];
    }
  }
  return searchedNote;
}

module.exports = {
  dbUsers,
  storedUser,
  getUser,
  getUserWithId,
  getAllNotes,
  updateNotes,
  deleteNote,
  search,
};
