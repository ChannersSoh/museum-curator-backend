import request from "supertest";
import { startServer } from "../server"; 
import { pool } from "../db";
import { seed } from "../db/seed";
import { Server } from "http";

let server: Server;
let authToken: string;
let collectionId: number;
let exhibitId = "harvard-001"; 

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await seed();
  server = startServer(5001);
});

afterAll(async () => {
  await pool
    .query("TRUNCATE TABLE exhibits, collections, users RESTART IDENTITY CASCADE")
    .catch(console.error);
  await pool.end().catch(console.error);
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("Root Endpoint", () => {
  it("GET / should return the API root message", async () => {
    const res = await request(server).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("This is the API root route.");
  });
});

describe("Exhibits Endpoints", () => {
  it("GET /api/exhibits should return an array of exhibits", async () => {
    const res = await request(server).get("/api/exhibits");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.exhibits)).toBe(true);
  }, 30000);

  it("GET /api/exhibits/:id should return exhibit details for a valid exhibit ID", async () => {
    const exhibitsRes = await request(server).get("/api/exhibits");
    const validExhibitId = exhibitsRes.body.exhibits[0]?.id || "harvard-208675"; 
    const res = await request(server).get(`/api/exhibits/${validExhibitId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.exhibit).toHaveProperty("id", validExhibitId); 
  });
  
  it("GET /api/exhibits/:id should return 404 for an invalid exhibit ID", async () => {
    const res = await request(server).get(`/api/exhibits/invalid-id`);
    expect(res.status).toBe(404);
  });
});

describe("Auth Endpoints", () => {
  it("POST /register should register a new user", async () => {
    const newUser = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    const res = await request(server).post("/register").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.username).toEqual("testuser");
    expect(res.body).toHaveProperty("token");
  });

  it("POST /login should login a user and return a token", async () => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
    };

    const res = await request(server).post("/login").send(credentials);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    authToken = res.body.token;
  });

  it("POST /login should return 401 for incorrect credentials", async () => {
    const res = await request(server)
      .post("/login")
      .send({ email: "test@example.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });
});

describe("Collections Endpoints", () => {
  beforeAll(async () => {
    const user = {
      username: "collectionUser",
      email: "collection@example.com",
      password: "password456",
    };

    await request(server).post("/register").send(user);
    const loginRes = await request(server)
      .post("/login")
      .send({ email: user.email, password: user.password });
    authToken = loginRes.body.token;
  });

  it("POST /collections should create a new collection (protected)", async () => {
    const newCollection = {
      name: "My Collection",
      description: "A collection of my favorite exhibits",
    };

    const res = await request(server)
      .post("/collections")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newCollection);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toEqual(newCollection.name);
    collectionId = res.body.id;
  });

  it("GET /collections should return all user collections (protected)", async () => {
    const res = await request(server)
      .get("/collections")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /collections/:id/exhibits should return an empty array initially", async () => {
    const res = await request(server)
      .get(`/collections/${collectionId}/exhibits`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("POST /collections/save should save an exhibit to a collection (protected)", async () => {
    const exhibitToSave = {
      collectionId,
      exhibitId,
      title: "Mona Lisa",
      institution: "Harvard Art Museums",
    };

    const res = await request(server)
      .post("/collections/save")
      .set("Authorization", `Bearer ${authToken}`)
      .send(exhibitToSave);

    expect([200, 201]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty("exhibit_id", exhibitToSave.exhibitId);
    }
  });

  it("GET /collections/:id/exhibits should return the added exhibit", async () => {
    const res = await request(server)
      .get(`/collections/${collectionId}/exhibits`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("id", exhibitId);
  });

  it("DELETE /collections/exhibits should remove an exhibit from a collection", async () => {
    const res = await request(server)
      .delete("/collections/exhibits")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ collectionId, exhibitId });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Exhibit removed from collection");
  });

  it("GET /collections/:id/exhibits should return an empty list after removal", async () => {
    const res = await request(server)
      .get(`/collections/${collectionId}/exhibits`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it("DELETE /collections/exhibits should return 404 if exhibit is not in collection", async () => {
    const res = await request(server)
      .delete("/collections/exhibits")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ collectionId, exhibitId });

    expect(res.status).toBe(404);
  });
});
