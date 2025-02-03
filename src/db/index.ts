import { Pool } from "pg";
import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "test"
    ? ".env.test"
    : process.env.NODE_ENV === "development"
    ? ".env.development"
    : ".env";

dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected error", err);
  process.exit(-1);
});
