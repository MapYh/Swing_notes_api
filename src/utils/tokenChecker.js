require("dotenv").config();
const jwt = require("jsonwebtoken");

async function tokenChecker(req, res, next) {
  const token = req.headers.authorization;

  try {
    const resultFromToken = await jwt.verify(
      token.replace(`Bearer `, ``),
      process.env.JWS_SECRET
    );
    console.log("Token checker", resultFromToken);
    req.resultFromToken = resultFromToken;
  } catch (error) {
    res.status(500).json({ message: "Expired token" });
  }
  next();
}

module.exports = { tokenChecker };
