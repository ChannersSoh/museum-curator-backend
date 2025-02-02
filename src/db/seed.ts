import format from "pg-format";
import { pool } from "./index";

export const seed = async (): Promise<void> => {
  try {
    await pool.query(`DROP TABLE IF EXISTS collection_exhibits;`);
    await pool.query(`DROP TABLE IF EXISTS exhibits;`);
    await pool.query(`DROP TABLE IF EXISTS collections;`);
    await pool.query(`DROP TABLE IF EXISTS users;`);

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE collections (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE exhibits (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        institution TEXT NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE collection_exhibits (
        id SERIAL PRIMARY KEY,
        collection_id INT REFERENCES collections(id) ON DELETE CASCADE,
        exhibit_id TEXT REFERENCES exhibits(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(collection_id, exhibit_id)
      );
    `);

    const userData = [
      ["johndoe", "john@example.com", "hashedpassword1"],
      ["janedoe", "jane@example.com", "hashedpassword2"],
    ];
    const insertUsersQuery = format(
      "INSERT INTO users (username, email, password_hash) VALUES %L RETURNING *;",
      userData
    );
    const usersResult = await pool.query(insertUsersQuery);
    console.log("Users seeded:", usersResult.rows);

    const collectionsData = [
      [usersResult.rows[0].id, "Favorites", "A collection of favorite exhibits"],
      [usersResult.rows[0].id, "To Explore", "Exhibits I want to check out"],
    ];
    const insertCollectionsQuery = format(
      "INSERT INTO collections (user_id, name, description) VALUES %L RETURNING *;",
      collectionsData
    );
    const collectionsResult = await pool.query(insertCollectionsQuery);
    console.log("Collections seeded:", collectionsResult.rows);

    const exhibitsData = [
      ["harvard-001", "Mona Lisa", "Harvard Art Museums", usersResult.rows[0].id],
      ["smithsonian-001", "The Starry Night", "Smithsonian", usersResult.rows[0].id],
    ];
    const insertExhibitsQuery = format(
      "INSERT INTO exhibits (id, title, institution, user_id) VALUES %L RETURNING *;",
      exhibitsData
    );
    const exhibitsResult = await pool.query(insertExhibitsQuery);
    console.log("Exhibits seeded:", exhibitsResult.rows);

    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    if (process.env.NODE_ENV !== "test") {
      await pool.end();
    }
  }
};

if (require.main === module) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
