const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const middleware = require("./utils/middleware");
const { MONGODB_URI, PORT } = require("./utils/config");
const { info } = require("./utils/logger");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    info("Connected to MongoDB");
  })
  .catch((error) => {
    error("Error connecting to MongoDB:", error);
  });

app.use(cors());
app.use(express.json());

app.use(middleware.tokenExtractor);
app.use(middleware.userExtactor);
app.use(middleware.requestLogger);

app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/blogs", blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
