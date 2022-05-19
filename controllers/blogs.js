const blogsRouter = require("express").Router();
const Blog = require("../models/blogs");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const { getToken } = require("../utils/login_helper");

blogsRouter.get("/", (request, response, next) => {
  Blog.find({})
    .populate("user", { username: 1, name: 1 })
    .then((blogs) => {
      response.json(blogs);
    })
    .catch((error) => next(error));
});

blogsRouter.post("/", (request, response, next) => {
  let body = request.body;
  const token = request.token;
  if (token) {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    body.user = decodedToken.id;
    User.findById(decodedToken.id).then((user) => {
      if (user) {
        const blog = new Blog(body);
        blog
          .save()
          .then((result) => {
            user.blogs = user.blogs.concat(result._id);
            user.save();
            response.status(201).json(result);
          })
          .catch((error) => next(error));
      }
    });
  } else {
    return response.status(401).json({ error: "token missing or invalid" });
  }
});

blogsRouter.delete("/:id", (request, response, next) => {
  const token = request.token;
  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      Blog.findById(request.params.id)
        .then((blog) => {
          if (blog.user.toString() === decodedToken.id.toString()) {
            Blog.findByIdAndDelete(request.params.id)
              .then((result) => {
                response.status(204).end();
              })
              .catch((error) => next(error));
          } else {
            return response.status(401).json({ error: "invalid token" });
          }
        })
        .catch((error) => next(error));
    } else {
      return response.status(401).json({ error: "token missing or invalid" });
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/", (request, response, next) => {
  Blog.remove({})
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

blogsRouter.put("/:id", (request, response, next) => {
  const body = request.body;
  const token = request.token;
  if (token) {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    Blog.findById(request.params.id)
      .then((blog) => {
        if (blog.user.toString() === decodedToken.id.toString()) {
          Blog.findByIdAndUpdate(request.params.id, body, { new: true })
            .then((result) => {
              response.json(result);
            })
            .catch((error) => next(error));
        } else {
          return response.status(401).json({ error: "invalid token" });
        }
      })
      .catch((error) => next(error));
  }
});

module.exports = blogsRouter;
