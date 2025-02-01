import { Request, Response } from "express";
import { getExhibitsWithImages } from "../utils/getExhibitsWithImages";

export const getExhibits = async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const desiredPageSize = parseInt(req.query.pageSize as string) || 20;

    const finalExhibits = await getExhibitsWithImages(query, page, desiredPageSize);

    res.json({
      page,
      pageSize: desiredPageSize,
      totalResults: finalExhibits.length,
      exhibits: finalExhibits,
    });
  } catch (error) {
    console.error("Error fetching exhibits:", error);
    res.status(500).send("Error fetching art objects");
  }
};
