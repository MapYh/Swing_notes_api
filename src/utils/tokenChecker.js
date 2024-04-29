require("dotenv").config();
const jwt = require("jsonwebtoken");

async function tokenChecker(req, res, next) {
  const token = req.headers.authorization;

  try {
    const resultFromToken = await jwt.verify(
      token.replace(`Bearer `, ``),
      process.env.JWS_SECRET
    );
    //Läger till resultatet från verify ovan till anropet.
    req.resultFromToken = resultFromToken;
  } catch (error) {
    res.status(500).json({ message: "Expired token" });
  }
  next();
}

module.exports = { tokenChecker };
