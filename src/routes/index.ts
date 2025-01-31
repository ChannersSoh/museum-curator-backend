import { Router } from "express";
import { getArtworks } from "../controllers/artworkController";

const router = Router();

router.get("/", (req, res) => {
  res.send("This is the API root route.");
});


router.get("/artworks", getArtworks);

export default router;