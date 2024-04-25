const bcrypt = require("bcryptjs");

async function hashedPassword(password) {
  const encryptedPassword = await bcrypt.hash(password, 10);

  return encryptedPassword;
}

async function comparePassword(password, encyptedPassword) {
  const passwordMatches = await bcrypt.compare(password, encyptedPassword);
  return passwordMatches;
}

module.exports = { hashedPassword, comparePassword };
