const userRouter = require("express").Router();
const User = require("../models/users");
var bcrypt = require("bcryptjs");

userRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find({}).populate("blogs");
    response.json(users);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body;

    if (body.password === undefined) {
      return response.status(400).json({ error: "password missing" });
    }
    if (body.password.length < 3) {
      return response.status(400).json({ error: "password too short" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash: passwordHash,
    });
    const savedUser = await user.save();
    response.status(201).json(savedUser.toJSON());
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/", async (request, response, next) => {
  try {
    await User.deleteMany({});
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = userRouter;
