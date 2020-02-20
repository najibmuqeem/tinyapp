const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookie());

app.set("view engine", "ejs");

const users = {
  cI0C98: {
    id: "cI0C98",
    email: "najib@noah.com",
    password: "123"
  },
  p7J12w: {
    id: "p7J12w",
    email: "noah@noah.com",
    password: "123"
  }
};

const urlDatabase = {};

const urlsForUser = id => {
  let urls = [];
  for (let short in urlDatabase) {
    if (urlDatabase[short].userID === id) {
      urls.push(short);
    }
  }

  return urls;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let urlData = {};

  let urlArr = urlsForUser(req.cookies.user_id);

  for (let key in urlDatabase) {
    for (let j = 0; j < urlArr.length; j++) {
      if (key === urlArr[j]) {
        urlData[key] = urlDatabase[key];
      }
    }
  }

  let templateVars;
  if (req.cookies.user_id) {
    templateVars = {
      urls: urlData,
      user: users[req.cookies.user_id]
    };
  } else {
    templateVars = { urls: urlData, user: undefined };
  }
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  if (req.body.email === "") {
    res.status(400).send("Empty email input.\n");
  }
  if (req.body.password === "") {
    res.status(400).send("Empty password input.\n");
  }
  let id = generateRandomString();
  let exists = false;
  for (let i in users) {
    if (users[i].email === req.body.email) {
      exists = true;
      break;
    }
  }
  if (!exists) {
    users[id] = {};

    users[id]["id"] = id;
    users[id]["email"] = req.body.email;
    users[id]["password"] = req.body.password;

    res.cookie("user_id", id);
  } else {
    res.status(400).send("Email already exists.\n");
  }
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = {};
  urlDatabase[short]["longURL"] = Object.values(req.body)[0];
  urlDatabase[short]["userID"] = req.cookies.user_id;
  res.redirect(`urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403).send("Not authorized to delete URL.\n");
  }

  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = {};
  urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
  urlDatabase[req.params.shortURL]["userID"] = req.cookies.user_id;
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let id;
  for (let i in users) {
    if (
      users[i].email === req.body.email &&
      users[i].password === req.body.password
    ) {
      id = users[i].id;
      res.cookie("user_id", id);
    }
  }
  if (!req.cookies.user_id) {
    res.status(403).send("Invalid username or password.\n");
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let urlData = {};

  let urlArr = urlsForUser(req.cookies.user_id);

  for (let i in urlDatabase) {
    for (let j = 0; j < urlArr.length; j++) {
      if (i === urlArr[j]) {
        urlData[i] = urlDatabase[i];
      }
    }
  }

  if (req.cookies.user_id) {
    let templateVars = { urls: urlData, user: users[req.cookies.user_id] };

    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const address = urlDatabase[req.params.shortURL].longURL;
  console.log(urlDatabase);
  console.log(urlDatabase[req.params.shortURL]);
  console.log(address);
  res.redirect(address);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
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
