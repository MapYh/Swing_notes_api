const Datastore = require("nedb-promises");

const dbUsers = new Datastore({ filename: `./model/users.db`, autoload: true });

//Spara en användare i databasen.
function storedUser(username, password, notes) {
  dbUsers.insert(
    { username: username, password: password, notes: notes },
    function (err, newDoc) {}
  );
}
//Hämtar en användare från databasen via användarnamn.
function getUser(username) {
  return dbUsers.findOne({ username: username });
}
//Hämtar en användare från databasen via id.
function getUserWithId(id) {
  return dbUsers.findOne({ _id: id });
}
//Hämtar alla anteckningar från databasen tillhörande en viss användare.
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
//Updatera en anteckning från databasen tillhörande en viss användare.
async function updateNote(id, updatedInfo) {
  const user = await dbUsers.findOne({ _id: id }, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log("docs", docs);
      return docs;
    }
  });

  //Om det finns en anteckning med samma id som i anropet, updatera anteckningen.

  //Letar efter en anteckning med samma id som i anropet från postman.
  for (let i = 0; i < user.notes.length; i++) {
    if (user.notes[i].id == updatedInfo.id) {
      //Kollar om anteckninge och anropet har samma inehåll redan.
      if (
        user.notes[i].text == updatedInfo.text &&
        user.notes[i].title == updatedInfo.title
      ) {
        return "same content";
      } else {
        //Updaterar innheållet i anteckningen med det som finns i anropet från postman.
        user.notes[i].text = updatedInfo.text;
        user.notes[i].title = updatedInfo.title;
        user.notes[i].modifiedAt = updatedInfo.modifiedAt;
      }
    } else {
      return null;
    }
  }
  const notes = user.notes;
  await dbUsers.update({ _id: id }, { $set: { notes } });

  //Returnerar alla anteckningar
  return notes;
}

//Letar upp en anteckning och raderar den.
async function deleteNote(id, idToDelete) {
  const user = await dbUsers.findOne({ _id: id }, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      return docs;
    }
  });
  //Letar efter en anteckning med samma id som i anropet från postman.
  for (let i = 0; i < user.notes.length; i++) {
    if (user.notes[i].id == idToDelete.id) {
      //Raderar den sökta anteckningen.
      user.notes.splice(i, 1);
    }
  }
  const notes = user.notes;
  //Updaterar den sökta användarens dokument.
  await dbUsers.update({ _id: id }, { $set: { notes } });
}
//Letar upp en anteckning baserad på titeln.
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
  //Letar efter en anteckning med samma titel som i anropet från postman.
  for (let i = 0; i < user.notes.length; i++) {
    if (user.notes[i].title == title) {
      searchedNote = user.notes[i];
    }
  }
  //Returnerar den sökta anteckningen.
  return searchedNote;
}

module.exports = {
  dbUsers,
  storedUser,
  getUser,
  getUserWithId,
  getAllNotes,
  updateNote,
  deleteNote,
  search,
};
