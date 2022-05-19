const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("../utils/blog_helper");

const api = supertest(app);
const Blog = require("../models/blogs");

let token = null;
let id = null;
const blogsInDB = [];

beforeEach(async () => {
  await Blog.deleteMany({});
  const tokenReq = await api.post("/api/login").send({
    username: "root",
    password: "root",
  });
  token = tokenReq.body.token;
  id = tokenReq.body.id;
  const blogs = helper.blogs.map((blog) => {
    return { user: id, ...blog };
  });
  await Blog.insertMany(blogs);
});

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 60000);

  test("a valid blog can be added", async () => {
    const initialBlogs = helper.blogs.length;
    const newBlog = {
      title: "Test blog",
      author: "Test author",
      url: "http://www.test.com",
      likes: 5,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs + 1);
    const addedBlog = blogsAtEnd.find((blog) => blog.title === newBlog.title);
    expect(addedBlog).toBeDefined();
    expect(addedBlog.author).toBe(newBlog.author);
  }, 60000);

  test("should check for unique identifier", async () => {
    const blog = {
      title: "Undercover",
      author: "Bikram",
      url: "bikram.dutta",
      likes: 10000,
    };
    const blog2 = {
      title: "Untitled",
      author: "Bikram",
      url: "bikram.dutta",
      likes: 10000,
    };
    const blogResponse1 = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(blog);
    const blogResponse2 = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(blog2);

    expect(blogResponse1.body.id).toBeDefined();
    expect(blogResponse2.body.id).toBeDefined();
    expect(blogResponse1.body.id).not.toBe(blogResponse2.body.id);
  }, 60000);

  test("should check for likes", async () => {
    const blog = {
      title: "Undercover",
      author: "Bikram",
      url: "bikram.dutta",
    };
    const blogResponse = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(blog);
    expect(blogResponse.body.likes).toBe(0);
  });

  test("should check for title and url", async () => {
    const blog = {
      author: "Bikram",
      likes: 10000,
      url: "bikram.dutta",
    };
    const blog2 = {
      author: "Bikram",
      title: "Untitled",
      likes: 10000,
    };
    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(blog)
      .expect(400);
    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(blog2)
      .expect(400);
  }, 10000);
});

describe(" when there is blog update", () => {
  test("a valid blog can be updated", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = {
      title: "Updated blog",
      ...blogToUpdate,
    };
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `bearer ${token}`)
      .send(updatedBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    const updatedBlogAtEnd = blogsAtEnd.find(
      (blog) => blog.id === blogToUpdate.id
    );
    expect(updatedBlogAtEnd.title).toBe(updatedBlog.title);
  }, 60000);
});

describe("when there is blog deletion", () => {
  test("a valid blog can be deleted", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);
    const blogAtEnd = blogsAtEnd.find((blog) => blog.id === blogToDelete.id);
    expect(blogAtEnd).toBe(undefined);
  }, 60000);
});

// afterAll(() => {
//   mongoose.connection.close();
// });
