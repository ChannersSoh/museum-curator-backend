import { Router } from "express";
import { getExhibits } from "../controllers/exhibitController";
import { getExhibitById } from "../controllers/exhibitByIdController";
import { registerUser, loginUser } from "../controllers/authController";
import { createCollection, saveExhibitToCollection, getUserCollections, getCollectionExhibits, removeExhibitFromCollection, deleteCollection } from "../controllers/collectionController";
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
router.get("/collections", authenticateUser, getUserCollections);
router.get("/collections/:id/exhibits", authenticateUser, getCollectionExhibits);
router.delete("/collections/exhibits", authenticateUser, removeExhibitFromCollection);
router.delete("/collections/:id", authenticateUser, deleteCollection);


export default router;
