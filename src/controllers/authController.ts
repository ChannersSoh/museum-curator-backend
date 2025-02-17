import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: "Email is already in use" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, normalizedEmail, hashedPassword]
    );

    const token = jwt.sign({ id: result.rows[0].id, email: normalizedEmail }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.status(201).json({ user: result.rows[0], token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user." });
  }
};


export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" }); // Don't reveal if email exists
      return;
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: normalizedEmail }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in." });
  }
};
