import request from "supertest";
import { getConnection } from "typeorm";

import createConnection from "../database";
import app from "../app";

describe("Users", () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/users").send({
      email: "user@example.com",
      name: "User Example"
    });
    console.log(response.body);
    expect(response.status).toBe(201);
  });

  it("Shouldn't be able to create a user with a already existing email.", async () => {
    const response = await request(app).post("/users").send({
      email: "user@example.com",
      name: "User Example"
    });
    console.log(response.body);
    expect(response.status).toBe(400);
  });
});