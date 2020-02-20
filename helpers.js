const getUserByEmail = function(email, database) {
  let id;
  for (let user in database) {
    if (database[user].email === email) {
      id = database[user].id;
    }
  }

  let user = database[id];

  return user;
};

module.exports = { getUserByEmail };
