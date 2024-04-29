const { getUser } = require("../services/database.js");
const { comparePassword } = require("../utils/bcrypt.js");
const jwt = require("jsonwebtoken");

async function login(req, res, next) {
  const { username, password } = req.body;
  //Hämtar en användare med det relevanta användarnament.
  const user = await getUser(username);
  let userPassword;
  if (user == null) {
    res.status(404).json({ success: false, message: "User not found." });
    return;
  } else {
    userPassword = user.password;
  }

  try {
    //Testa om användaren och anropet har samma lösenord.
    const correctPassword = await comparePassword(password, userPassword);
    if (correctPassword) {
      //Skapar en token till användaren.
      const token = await jwt.sign({ id: user._id }, process.env.JWS_SECRET, {
        expiresIn: 60000,
      });
      //Sparar token och loggin status i request.
      req.token = token;
      req.loggedIn = true;
      next();
    } else {
      req.loggedIn = false;
      next();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
  next();
}

module.exports = { login };
