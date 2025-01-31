import { Request, Response } from "express";
import { getHarvardObjects, getSmithsonianData } from "../utils/api"; 

export const getExhibits = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const searchQuery = (query as string) || "";

    const [harvardObjects, smithsonianData] = await Promise.all([
      getHarvardObjects(searchQuery),
      getSmithsonianData(searchQuery),
    ]);

    let combinedExhibits = [...harvardObjects, ...smithsonianData];

    combinedExhibits.sort((a, b) => a.title.localeCompare(b.title));

    res.json(combinedExhibits);
  } catch (error) {
    console.error("Error fetching exhibits:", error);
    res.status(500).send("Error fetching art objects");
  }
};
