import { Request, Response } from "express";
import { fetchExhibitById } from "../utils/fetchExhibitById";

export const getExhibitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Exhibit ID is required" });
      return;
    }

    const exhibitData = await fetchExhibitById(id);

    res.json({ exhibit: exhibitData });
  } catch (error) {
    const err = error as Error; 
    res.status(500).json({ error: err.message });
  }
};
