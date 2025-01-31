import { Router } from "express";
import { getExhibits } from "../controllers/exhibitController";

const router = Router();

router.get("/", (req, res) => {
  res.send("This is the API root route.");
});


router.get("/exhibits", getExhibits);

export default router;