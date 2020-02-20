const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookie = require("cookie-session");
const bcrypt = require("bcrypt");
const { getUserByEmail } = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookie({ name: "user_id", secret: "abc" }));
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const users = {}; //initialize empty global user database

const urlDatabase = {}; //initialize empty global url database

const urlsForUser = id => {
  let urlArr = [];
  //push relevant urls into an array
  for (let short in urlDatabase) {
    if (urlDatabase[short].userID === id) {
      urlArr.push(short);
    }
  }

  let urls = {};

  //create url database only containing urls relevant to current user
  for (let key in urlDatabase) {
    for (let j = 0; j < urlArr.length; j++) {
      if (key === urlArr[j]) {
        urls[key] = urlDatabase[key];
      }
    }
  }

  return urls;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let urlData = urlsForUser(req.session.user_id);
  let templateVars;
  // if there is a user logged in, pass only the logged in user and the urls relevant to that user
  if (req.session.user_id) {
    templateVars = {
      urls: urlData,
      user: users[req.session.user_id]
    };
  } else {
    templateVars = { urls: urlData, user: undefined };
  }
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let urlData = urlsForUser(req.session.user_id);
  //if there is a user logged in, pass only the logged in user and the urls relevant to that user
  if (req.session.user_id) {
    let templateVars = { urls: urlData, user: users[req.session.user_id] };

    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  // pass the current short URL selected along with its corresponding long URL and the current user
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const address = urlDatabase[req.params.shortURL].longURL;

  res.redirect(address);
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  // set a new long URL and the current user and redirect to a page containing only that URL and its shortened version
  urlDatabase[short] = {
    longURL: Object.values(req.body)[0],
    userID: req.session.user_id
  };

  res.redirect(`urls/${short}`);
});

app.post("/urls/:shortURL", (req, res) => {
  // if the logged in user created the current URL in question, allow them to edit
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };

    res.redirect("/urls");
  } else {
    res.status(401).send("Not authorized to edit URL.\n");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // if the logged in user created the current URL in question, allow them to delete
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("Not authorized to delete URL.\n");
  }
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please provide both a username and password.\n");
    res.clearCookie("user_id");
  }

  let id = generateRandomString();
  let user = getUserByEmail(req.body.email, users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  // if the user does not exist in the database, add them
  if (!user) {
    users[id] = {};

    users[id]["id"] = id;
    users[id]["email"] = req.body.email;
    users[id]["password"] = hashedPassword;

    req.session.user_id = id;
    res.redirect("/urls");
  } else {
    res.status(400).send("Email already exists.\n");
  }
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  // if the user exists, compare the password to the hashed password and log them in
  if (!user) {
    res.status(403).send("User does not exist.\n");
  } else {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Password is incorrect.");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
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
