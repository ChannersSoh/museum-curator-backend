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

    if (!exhibitData) {
      res.status(404).json({ error: "Exhibit not found" }); // ✅ Properly return 404
      return;
    }

    res.json({ exhibit: exhibitData });
  } catch (error) {
    console.error(`Error fetching exhibit ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};
