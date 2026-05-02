import { beforeAll, describe, expect, it } from "bun:test";

import { app, cleanupDatabase, getAdminToken, request, seedAdmin } from "./setup.ts";

beforeAll(async () => {
  await cleanupDatabase();
  await seedAdmin();
});

describe("Auth", () => {
  it("POST /auth/login returns 200 and token for valid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@example.com",
      password: "admin123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("admin@example.com");
    expect(res.body.user.role).toBe("ADMIN");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("POST /auth/login returns 401 for invalid password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("POST /auth/login returns 401 for nonexistent user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "nobody@test.com",
      password: "secret123",
    });

    expect(res.status).toBe(401);
  });

  it("POST /auth/login returns 400 for invalid body", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "notanemail",
      password: "12",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  describe("GET /auth/me", () => {
    it("returns 200 and current user for valid token", async () => {
      const token = await getAdminToken();

      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("admin@example.com");
      expect(res.body.role).toBe("ADMIN");
      expect(res.body.name).toBe("Admin");
      expect(res.body.id).toBeDefined();
      expect(res.body).not.toHaveProperty("password");
    });

    it("returns 401 without token", async () => {
      const res = await request(app).get("/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Authentication required");
    });

    it("returns 401 with invalid token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer invalidtoken123");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });
});
