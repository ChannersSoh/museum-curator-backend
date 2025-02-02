import { Request, Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { CreateCollectionBody, SaveExhibitBody } from "../models/requests"; 

export const createCollection = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, description } = req.body as CreateCollectionBody;
  const userId = req.user.id;

  pool.query(
    "INSERT INTO collections (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
    [userId, name, description]
  )
    .then((result) => {
      res.status(201).json(result.rows[0]);
    })
    .catch(next);
};

export const saveExhibitToCollection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { collectionId, exhibitId, title, institution } = req.body as SaveExhibitBody;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const exhibitResult = await pool.query(
      "SELECT * FROM exhibits WHERE id = $1",
      [exhibitId]
    );

    if (exhibitResult.rows.length === 0) {
      await pool.query(
        "INSERT INTO exhibits (id, title, institution, user_id) VALUES ($1, $2, $3, $4)",
        [exhibitId, title, institution, req.user.id]
      );
    }

    const query = `
      INSERT INTO collection_exhibits (collection_id, exhibit_id)
      VALUES ($1, $2)
      ON CONFLICT (collection_id, exhibit_id) DO NOTHING
      RETURNING *;
    `;
    const joinResult = await pool.query(query, [collectionId, exhibitId]);

    if (joinResult.rows.length === 0) {
      res.status(200).json({ message: "Exhibit already in collection" });
      return;
    }

    res.status(201).json(joinResult.rows[0]);
  } catch (error) {
    console.error("Error saving exhibit:", error);
    next(error);
  }
};