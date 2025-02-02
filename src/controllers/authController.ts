import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user." });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (result.rows.length === 0) {
        res.status(401).json({ error: "Invalid credentials" });
        return; 
      }
  
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
  
      if (!match) {
        res.status(401).json({ error: "Invalid credentials" });
        return; 
      }
  
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
        expiresIn: "1h",
      });
  
      res.json({ token });
      return; 
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to log in." });
      return; 
  };
}