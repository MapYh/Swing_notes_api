require("dotenv").config();

const express = require("express");
const { login } = require("./src/components/login.js");
const { signup } = require("./src/components/singup.js");
const { tokenChecker } = require("./src/utils/tokenChecker.js");
const {
  getAllNotes,
  getUserWithId,
  dbUsers,
  updateNotes,
} = require("./src/services/database.js");
const { bodyChecker } = require("./src/utils/bodychecker.js");
const swaggerUI = require("swagger-ui-express");
const apiDocs = require("./docs/docs.json");

const app = express();
// Tolkar allt som kommer i en body som JSON
app.use(express.json());
app.use("/api/docs", swaggerUI.serve);
app.get("/api/docs", swaggerUI.setup(apiDocs));

/*-----------POST---------------*/
app.post("/api/users/signup", signup, async (req, res) => {});

app.post("/api/users/login", login, async (req, res) => {
  console.log("test", req.body);
  console.log("token", req.token);
  try {
    res.status(200).json({ message: "You are logged in." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

app.post("/api/notes", [tokenChecker, bodyChecker], async (req, res) => {
  const note = req.body;

  const user = await getUserWithId(req.resultFromToken.id);
  try {
    if (req.resultFromToken && !(user == null)) {
      user.notes.push(note);
      console.log("index", user);
      dbUsers.update(
        { _id: req.resultFromToken.id },
        { $set: { notes: user.notes } }
      );
      res.status(200).json({ message: `Note saved to your account.` });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*-----------GET---------------*/

app.get("/api/notes", tokenChecker, async (req, res) => {
  try {
    if (req.resultFromToken) {
      const allNotes = await getAllNotes(req.resultFromToken.id);
      res.status(200).json({ notes: allNotes });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*-----------PUTS---------------*/

app.put("/api/notes", tokenChecker, async (req, res) => {
  const updatedInfo = req.body;
  console.log("up", updatedInfo);
  try {
    if (req.resultFromToken) {
      const updatedNote = await updateNotes(
        req.resultFromToken.id,
        updatedInfo
      );

      res.status(200).json({ message: "notes updated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/*-----------SERVER---------------*/

app.listen(process.env.PORT, process.env.BASE_URL, () => {
  console.log(
    `Server running at : http://${process.env.BASE_URL}:${process.env.PORT}`
  );
});
