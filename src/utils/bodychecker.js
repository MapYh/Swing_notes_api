async function bodyChecker(req, res, next) {
  const requestBody = req.body;
  //Validering. Kollar om några extra keys förutom dom bestämda smyger med
  const validateBody = await Object.keys(requestBody).filter(
    (key) => !["id", "title", "text", "createdAt", "modifiedAt"].includes(key)
  );

  if (validateBody.length > 0) {
    return res.status(400).json({ message: "body contained wrong Keys" });
  }
  //Kontrollerar att alla värden har korrekt typ.
  const validateBodyValues = await Object.values(requestBody).filter(
    (value) => {
      if (typeof value == "string") {
        return true;
      }
    }
  );
  if (!validateBodyValues.length == 5) {
    return res
      .status(400)
      .json({ message: "The body contained wrong type of values" });
  }

  //Kontrollerar att title och text fältens värden har korrekt längd.
  Object.keys(requestBody).filter((key) => {
    if (key == "title") {
      let length = requestBody[key].length;
      if (length >= 50) {
        return res.status(400).json({ message: "The title was too long." });
      }
    }
    if (key == "text") {
      let length = requestBody[key].length;
      if (length >= 300) {
        return res.status(400).json({ message: "The text was too long." });
      }
    }
  });

  next();
}

module.exports = { bodyChecker };
