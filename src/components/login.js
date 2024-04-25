const { getUser } = require("../services/database.js");
const { comparePassword } = require("../utils/bcrypt.js");
const jwt = require("jsonwebtoken");

async function login(req, res, next) {
  const { username, password } = req.body;
  const user = await getUser(username);
  if (user == null) {
    res.status(404).json("User not found.");
    return;
  }

  try {
    console.log(password);
    console.log(user.password);
    const correctPassword = await comparePassword(user.password, password);
    console.log(correctPassword);
    if (!correctPassword) {
      console.log(user._id);
      const token = await jwt.sign({ id: user._id }, process.env.JWS_SECRET, {
        expiresIn: 600,
      });
      req.token = token;
      next();
    }
  } catch (error) {
    res.status(500).json("Server error");
  }
  next();
}

module.exports = { login };
