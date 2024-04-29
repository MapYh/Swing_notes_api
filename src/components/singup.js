const { storedUser, getUser } = require("../services/database.js");
const { hashedPassword } = require("../utils/bcrypt.js");

async function signup(req, res, next) {
  //Tar ut det relevanta från förfrågan. id finns inte med eftersom NeDB
  //skapar ett unikt id för varje dokument.
  const { username, password, notes } = req.body;

  //Validering. Kollar om några extra keys förutom dom bestämda smyger med
  const validateBody = await Object.keys(req.body).filter(
    (key) => !["username", "password", "notes"].includes(key)
  );
  if (validateBody.length > 0) {
    return res.status(400).json({ message: "body contained wrong values" });
  }
  //Kolla om det finns en användare redan finns med det sökta användarnamnet.
  const user = await getUser(username);
  try {
    //Om det inte finns en användare med det sökta användar namnet,
    //Skapas en användare.
    if (!user) {
      //hashar lösenordet.
      const encyptedPassword = await hashedPassword(password);
      //Spara användaren med användarnamn, hashat lösenord och alla notes.
      const result = await storedUser(username, encyptedPassword, notes);
      //Om result innehåller något har en användare sparats.
      if (result) {
        res.status(200).json({ success: true, message: "User created." });
        next();
      }
      //400 returneras från bodychecker.js om någonting gick fel i anropet.
    } else {
      //404 om det inte gick att skapa en användare.
      res.status(404).json({ success: false, message: "user not created." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
}
//Exporterar funktionen.
module.exports = { signup };
