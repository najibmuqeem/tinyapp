const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = { KlZy92: "www.google.com", nS7Dd3: "www.noah.com" };

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = Object.values(req.body)[0];
  res.redirect(`urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let str = "";
  for (let i = 0; i < 6; i++) {
    let digitCode =
      Math.floor(Math.random() * (Math.floor(57) - Math.ceil(48))) +
      Math.ceil(48);
    let upCode =
      Math.floor(Math.random() * (Math.floor(90) - Math.ceil(65))) +
      Math.ceil(65);
    let lowCode =
      Math.floor(Math.random() * (Math.floor(122) - Math.ceil(97))) +
      Math.ceil(97);
    let digUpLow = Math.floor(Math.random() * Math.floor(3));
    if (digUpLow === 0) {
      str += String.fromCharCode(digitCode);
    } else if (digUpLow === 1) {
      str += String.fromCharCode(lowCode);
    } else if (digUpLow === 2) {
      str += String.fromCharCode(upCode);
    }
  }
  return str;
}
