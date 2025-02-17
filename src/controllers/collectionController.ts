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

export const getUserCollections = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT * FROM collections WHERE user_id = $1",
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching collections:", error);
    next(error);
  }
};

export const getCollectionExhibits = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const collectionId = parseInt(req.params.id);

  try {
    const collectionResult = await pool.query(
      "SELECT * FROM collections WHERE id = $1 AND user_id = $2",
      [collectionId, req.user.id]
    );

    if (collectionResult.rows.length === 0) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    const exhibitsResult = await pool.query(
      `SELECT e.id, e.title, e.institution, e.image_url AS "imageUrl", e.creator, e.date, e.collection, e.culture, e.medium, e.style_or_period AS "styleOrPeriod", e.location_created AS "locationCreated", e.description
       FROM exhibits e
       JOIN collection_exhibits ce ON e.id = ce.exhibit_id
       WHERE ce.collection_id = $1`,
      [collectionId]
    );

    res.status(200).json(exhibitsResult.rows);
  } catch (error) {
    console.error("Error fetching exhibits:", error);
    next(error);
  }
};


export const removeExhibitFromCollection = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { collectionId, exhibitId } = req.body;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const deleteResult = await pool.query(
      "DELETE FROM collection_exhibits WHERE collection_id = $1 AND exhibit_id = $2 RETURNING *",
      [collectionId, exhibitId]
    );

    if (deleteResult.rowCount === 0) {
      res.status(404).json({ error: "Exhibit not found in collection" });
      return;
    }

    res.status(200).json({ message: "Exhibit removed from collection" });
  } catch (error) {
    console.error("Error removing exhibit:", error);
    next(error);
  }
};
