const { info } = require("./logger");

const dummy = (blogs) => 1;

const likes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0);

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  const maxLikes = Math.max(...blogs.map((blog) => blog.likes));
  let blog = blogs.find((blog) => blog.likes === maxLikes);
  delete blog.__v;
  delete blog._id;
  delete blog.url;
  return blog;
};

const topBlogger = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  const blogsCounter = {};
  blogs.map((blog) => {
    if (blogsCounter[blog.author] === undefined) {
      blogsCounter[blog.author] = 1;
    } else {
      blogsCounter[blog.author]++;
    }
  });
  const maxCount = Math.max(...Object.values(blogsCounter));
  const topBlogger = Object.keys(blogsCounter).find(
    (blogger) => blogsCounter[blogger] === maxCount
  );
  return { author: topBlogger, blogs: maxCount };
};

const mostLikedBlogger = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  const blogsCounter = {};
  blogs.map((blog) => {
    if (blogsCounter[blog.author] === undefined) {
      blogsCounter[blog.author] = blog.likes;
    } else {
      blogsCounter[blog.author] += blog.likes;
    }
  });
  const maxCount = Math.max(...Object.values(blogsCounter));
  const mostLikedBlogger = Object.keys(blogsCounter).find(
    (blogger) => blogsCounter[blogger] === maxCount
  );
  return { author: mostLikedBlogger, likes: maxCount };
};

module.exports = {
  dummy,
  likes,
  favoriteBlog,
  topBlogger,
  mostLikedBlogger,
};
