const Datastore = require("nedb-promises");

//Skapar databasen.
const dbUsers = new Datastore({ filename: `./model/users.db`, autoload: true });

//Spara en användare i databasen.
function storedUser(username, password, notes) {
  return dbUsers.insert({
    username: username,
    password: password,
    notes: notes,
  });
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
let found = [];
//Updatera en anteckning från databasen tillhörande en viss användare.
async function updateNote(idtoken, updatedInfo) {
  const user = await dbUsers.findOne({ _id: idtoken });
  console.log("user id", user.notes[0].id);
  console.log("body id", updatedInfo.id);
  let flag = [];
  //Letar efter en anteckning med samma id som i anropet.
  for (let i = 0; i < user.notes.length; i++) {
    if (user.notes[i].id == updatedInfo.id) {
      //Kollar om anteckningen och anropet har samma inehåll redan.
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
        //Sparar den updaterade anteckningen i databasen.
        const notes = user.notes;
        await dbUsers.update({ _id: idtoken }, { $set: { notes } });
        return true;
      }
    } else {
      //Om ingen av anteckningarna är den sökta push false till en array.
      flag.push(false);
    }
  }
  //Om ingen av anteckningarna ska längden av flag vara lika lång som user.notes.
  //Vilket betyder att vi inte hittade någon anteckning.
  if (flag.length == user.notes.length) {
    return false;
  }
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
