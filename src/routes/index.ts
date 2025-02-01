import { Router } from "express";
import { getExhibits } from "../controllers/exhibitController";
import { getExhibitById } from "../controllers/exhibitByIdController"

const router = Router();

router.get("/", (req, res) => {
  res.send("This is the API root route.");
});

router.get("/api/exhibits", getExhibits);

router.get("/api/exhibits/:id", getExhibitById);

export default router;