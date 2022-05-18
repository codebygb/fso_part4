const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { MONGODB_URI, PORT } = require("./utils/config");
const { info } = require("./utils/logger");
const blogsRouter = require("./controllers/blogs");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    info("Connected to MongoDB");
  })
  .catch((error) => {
    error("Error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogsRouter);

app.listen(PORT, () => {
  info(`Server running on port ${PORT}`);
});
