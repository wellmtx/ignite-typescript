import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "@shared/infra/http/app";
import createConnection from "@shared/infra/typeorm";

let connection: Connection;
describe("List Categories Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(`INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license)
    VALUES('${id}', 'admin', 'admin@admin.com.br', '${password}', true, 'now()', 'xxxxxxxx')
  `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list all categories", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@admin.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/categories")
      .send({
        name: "Another Category SuperTest",
        description: "Another Category SuperTest",
      })
      .set({ Authorization: `Bearer ${token}` });

    await request(app)
      .post("/categories")
      .send({
        name: "Category SuperTest",
        description: "Category SuperTest",
      })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app).get("/categories");

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
});
