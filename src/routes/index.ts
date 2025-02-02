import { Router } from "express";
import { getExhibits } from "../controllers/exhibitController";
import { getExhibitById } from "../controllers/exhibitByIdController";
import { registerUser, loginUser } from "../controllers/authController";
import { createCollection, saveExhibitToCollection } from "../controllers/collectionController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.get("/", (req, res) => {
  res.send("This is the API root route.");
});

router.get("/api/exhibits", getExhibits);

router.get("/api/exhibits/:id", getExhibitById);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/collections", authenticateUser, createCollection);

router.post("/collections/save", authenticateUser, saveExhibitToCollection);

export default router;