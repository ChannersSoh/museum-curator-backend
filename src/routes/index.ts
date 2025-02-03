import { Router } from "express";
import { getExhibits } from "../controllers/exhibitController";
import { getExhibitById } from "../controllers/exhibitByIdController";
import { registerUser, loginUser } from "../controllers/authController";
import { createCollection, saveExhibitToCollection } from "../controllers/collectionController";
import { authenticateUser } from "../middleware/authMiddleware";
import { pool } from "../db/index";

const router = Router();

router.get("/", (req, res) => {
  res.send("This is the API root route.");
});

router.get("/api/exhibits", getExhibits);

router.get("/api/exhibits/:id", getExhibitById);

router.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "unable to connect to database" });
  }
});

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/collections", authenticateUser, createCollection);

router.post("/collections/save", authenticateUser, saveExhibitToCollection);

export default router;