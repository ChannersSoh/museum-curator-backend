import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("This is the API root route.");
});

router.get("/artworks", (req, res) => {
  res.send("Here you can search for artworks!");
});

export default router;
