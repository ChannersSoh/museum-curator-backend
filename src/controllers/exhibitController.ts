import { Request, Response } from "express";
import { getExhibitsWithFilters } from "../utils/getExhibitsWithFilters";

export const getExhibits = async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const desiredPageSize = parseInt(req.query.pageSize as string) || 20;

    const filters = {
      collection: req.query.collection as string | undefined,
      country: req.query.country as string | undefined,
      medium: req.query.medium as string | undefined,
    };

    const finalExhibits = await getExhibitsWithFilters(query, page, desiredPageSize, filters);

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
