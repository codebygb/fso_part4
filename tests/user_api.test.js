const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("../utils/user_helper");
const bcrypt = require("bcryptjs");

const User = require("../models/users");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const result = await User.insertMany(helper.users);
});

describe("when there is initially some users saved", () => {
  test("users are returned as json", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 60000);

  test("a valid user can be added", async () => {
    const initialUsers = (await helper.getUsersInDb()).length;
    const newUser = {
      username: "newUser",
      name: "New User",
      password: "newSecret",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.getUsersInDb();
    expect(usersAtEnd).toHaveLength(initialUsers + 1);
    expect(usersAtEnd[initialUsers].username).toBe(newUser.username);
  }, 60000);

  test("should check for unique identifier", async () => {
    const user = {
      username: "test1",
      name: "Test User1",
      password: "test1",
    };
    const user2 = {
      username: "test2",
      name: "Test User2",
      password: "test2",
    };
    const userResponse1 = await api.post("/api/users").send(user);
    const userResponse2 = await api.post("/api/users").send(user2);

    expect(userResponse1.body.id).toBeDefined();
    expect(userResponse2.body.id).toBeDefined();
    expect(userResponse1.body.id).not.toBe(userResponse2.body.id);
  }, 60000);
});

describe("when body is invalid", () => {
  test("username is missing", async () => {
    const user = {
      name: "Test User",
      password: "test",
    };
    await api.post("/api/users").send(user).expect(400);
  });

  test("password is missing", async () => {
    const user = {
      username: "Test User",
    };
    await api.post("/api/users").send(user).expect(400);
  });

  test("username is too short", async () => {
    const user = {
      username: "a",
      name: "Test User",
      password: "test",
    };
    await api.post("/api/users").send(user).expect(400);
  });

  test("password is too short", async () => {
    const user = {
      username: "PwdShrtUser",
      name: "Test User",
      password: "a",
    };
    await api.post("/api/users").send(user).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
