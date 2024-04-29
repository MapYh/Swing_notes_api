require("dotenv").config();

const express = require("express");
const { login } = require("./src/components/login.js");
const { signup } = require("./src/components/singup.js");
const { tokenChecker } = require("./src/utils/tokenChecker.js");
const {
  getAllNotes,
  getUserWithId,
  dbUsers,
  updateNote,
  deleteNote,
  search,
} = require("./src/services/database.js");
const { bodyChecker } = require("./src/utils/bodychecker.js");
const swaggerUI = require("swagger-ui-express");
const apiDocs = require("./docs/docs.json");

const app = express();
// Tolkar allt som kommer i en body som JSON.
app.use(express.json());
// För dokumentation i swagger.
app.use("/api/docs", swaggerUI.serve);
app.get("/api/docs", swaggerUI.setup(apiDocs));

/*-----------POST---------------*/
app.post("/api/users/signup", signup, async (req, res) => {});

app.post("/api/users/login", login, async (req, res) => {
  console.log("token", req.token);
  //Använd för att få en token till konsolen som du kan klistra in i postman.
  try {
    //Kollar om användaren har rätt användarnamn och lösenord.
    if (req.loggedIn) {
      res
        .status(200)
        .json({ success: req.loggedIn, message: "Du är inloggad." });
    } else {
      res.status(400).json({ success: req.loggedIn, message: "Fel lösenord." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});
//Lägger till en anteckning till en användare.
app.post("/api/notes", [tokenChecker, bodyChecker], async (req, res) => {
  const note = req.body;

  //Hämtar en användare baserad på id:t i token.
  const user = await getUserWithId(req.resultFromToken.id);

  try {
    if (req.resultFromToken && !(user == null)) {
      //Sparar anteckningen i notes arrayen i användar dokumentet.
      user.notes.push(note);
      //Updaterar användardokumentet med anteckningen.
      dbUsers.update(
        { _id: req.resultFromToken.id },
        { $set: { notes: user.notes } }
      );
      res.status(200).json({ success: true, message: `Anteckning sparad.` });
    } else {
      res
        .status(404)
        .json({ success: false, message: `Ingen användare hittades.` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*-----------GET---------------*/
//Hämtar alla antekningar till ett visst konto.
app.get("/api/notes", tokenChecker, async (req, res) => {
  try {
    if (req.resultFromToken) {
      const allNotes = await getAllNotes(req.resultFromToken.id);
      res.status(200).json({ success: true, notes: allNotes });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//Letar efter en anteckning via titel.
app.get("/api/notes/search", tokenChecker, async (req, res) => {
  const { title } = req.body;
  try {
    //Om token är giltig sök efter anteckningen.
    if (req.resultFromToken) {
      //Sök efter anteckningen.
      const note = await search(req.resultFromToken.id, title);
      //Om anteckningen hittas skicka ut ett meddelande till frontend.
      if (note) {
        res.status(200).json({ success: true, notes: note });
      } else {
        res.status(404).json({
          success: false,
          message: `Ingen anteckning hade titeln:${title}`,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*-----------PUT---------------*/

app.put("/api/notes", tokenChecker, async (req, res) => {
  const updatedInfo = req.body;
  console.log("here");
  try {
    if (req.resultFromToken) {
      //Updatera en anteckning med det som finns i anropet.
      const result = await updateNote(req.resultFromToken.id, updatedInfo);
      //Om resultatet är null fanns det inga anteckningar att uppdatera
      if (!(result == null)) {
        //Om anteckningen och anropet redan hade samma innehåll görs inget.
        if (result == "same content") {
          res.status(200).json({
            success: true,
            message: "Anteckning och anropet har samma inehåll.",
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Anteckningen uppdaterad.",
          });
        }
      } else {
        res
          .status(404)
          .json({ success: true, message: "Hittade inte anteckningen." });
      }
    } else {
      res
        .status(400)
        .json({ success: true, message: "Anteckningen blev inte uppdaterad" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*-----------DELETE---------------*/

app.delete("/api/notes", tokenChecker, async (req, res) => {
  const idToDelete = req.body;
  try {
    if (req.resultFromToken) {
      //Radera en anteckning med id från anropet.
      await deleteNote(req.resultFromToken.id, idToDelete);
      res
        .status(200)
        .json({ success: true, message: "Anteckninge är nu raderad." });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Hittade ingen giltig token." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*-----------SERVER---------------*/

app.listen(process.env.PORT, process.env.BASE_URL, () => {
  console.log(
    `Server running at : http://${process.env.BASE_URL}:${process.env.PORT}`
  );
});
