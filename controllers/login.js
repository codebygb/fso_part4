const loginRouter = require("express").Router();
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

loginRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body;
    const user = await User.findOne({ username: body.username });
    const passwordCorrect =
      user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash);
    if (!(user && passwordCorrect)) {
      return response
        .status(401)
        .json({ error: "invalid username or password" });
    }
    const userForToken = {
      username: user.username,
      id: user._id,
    };
    const token = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: "1h",
    });
    response.status(200).json({ token, id: user.id, name: user.name });
  } catch (error) {
    next(error);
  }
});

module.exports = loginRouter;
