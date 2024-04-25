const { storedUser, getUser } = require("../services/database.js");
const { hashedPassword } = require("../utils/bcrypt.js");

async function signup(req, res, next) {
  const { username, password, notes } = req.body;

  //Validering. Kollar om några extra keys förutom dom bestämda smyger med
  const validateBody = await Object.keys(req.body).filter(
    (key) => !["username", "password", "notes"].includes(key)
  );
  if (validateBody.length > 0) {
    return res.status(404).json({ message: "body contained wrong values" });
  }

  const user = await getUser(username);
  try {
    if (!user) {
      const encyptedPassword = await hashedPassword(password);
      await storedUser(username, encyptedPassword, notes);
      res.json({ message: "User created.", success: true });
      next();
    } else {
      res.status(404).json({ message: "user not created.", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
}

module.exports = { signup };
