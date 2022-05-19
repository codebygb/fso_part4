const user = require("../models/users");
const bcrypt = require("bcryptjs");

const users = [
  {
    username: "root",
    name: "Superuser",
    passwordHash: bcrypt.hashSync("root", 10),
  },
  {
    username: "test",
    name: "Test User",
    passwordHash: bcrypt.hashSync("test", 10),
  },
];

const getUsersInDb = async () => {
  const users = await user.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  users,
  getUsersInDb,
};
