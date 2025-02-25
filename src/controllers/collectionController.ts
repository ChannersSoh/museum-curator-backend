import { Request, Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { CreateCollectionBody, SaveExhibitBody } from "../models/requests"; 

export const createCollection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, description } = req.body as CreateCollectionBody;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "INSERT INTO collections (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, description]
    );

    const collection = { ...result.rows[0], exhibitCount: 0 };

    res.status(201).json(collection);
  } catch (error) {
    console.error("Error creating collection:", error);
    next(error);
  }
};

export const getUserCollections = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, 
              COUNT(ce.exhibit_id) AS "exhibitCount"
       FROM collections c
       LEFT JOIN collection_exhibits ce ON c.id = ce.collection_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.id`,
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching collections:", error);
    next(error);
  }
};



export const saveExhibitToCollection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    collectionId, exhibitId, title, institution, imageUrl, creator,
    date, collection, culture, medium, styleOrPeriod, locationCreated, description
  } = req.body as SaveExhibitBody;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const exhibitResult = await pool.query("SELECT * FROM exhibits WHERE id = $1", [exhibitId]);

    let exhibit = exhibitResult.rows.length > 0 ? exhibitResult.rows[0] : null;

    if (!exhibit) {
      exhibit = {
        id: exhibitId,
        title: title || "Untitled",
        institution: institution || "Unknown Institution",
        image_url: imageUrl,
        creator: creator || "Unknown",
        date: date || "Unknown",
        collection: collection || "Unknown",
        culture: culture || "Unknown",
        medium: medium || "Unknown",
        style_or_period: styleOrPeriod || "Unknown",
        location_created: locationCreated || "Unknown",           
        description: description || "No description available",
      };
      

      await pool.query(
        `INSERT INTO exhibits (id, title, institution, image_url, creator, date, collection, culture, medium, style_or_period, location_created, description, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          exhibit.id,
          exhibit.title,
          exhibit.institution,
          exhibit.image_url,
          exhibit.creator,
          exhibit.date,
          exhibit.collection,
          exhibit.culture,
          exhibit.medium,
          exhibit.style_or_period,
          exhibit.location_created,
          exhibit.description,
          req.user.id,
        ]
      );
    }

    const insertResult = await pool.query(
      `INSERT INTO collection_exhibits (collection_id, exhibit_id)
       VALUES ($1, $2)
       ON CONFLICT (collection_id, exhibit_id) DO NOTHING
       RETURNING *`,
      [collectionId, exhibitId]
    );

    if (insertResult.rowCount === 0) {
      res.status(200).json({ message: "Exhibit already in collection" });
      return;
    }

    res.status(201).json({ message: "Exhibit added to collection", exhibit });
  } catch (error) {
    console.error("Error saving exhibit to collection:", error);
    next(error);
  }
};

export const getCollectionExhibits = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const collectionId = parseInt(req.params.id);

  try {
    const collectionResult = await pool.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM collection_exhibits ce WHERE ce.collection_id = c.id) AS "exhibitCount"
       FROM collections c
       WHERE c.id = $1 AND c.user_id = $2`,
      [collectionId, req.user.id]
    );

    if (collectionResult.rows.length === 0) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    const exhibitsResult = await pool.query(
      `SELECT e.id, e.title, e.institution, 
              e.image_url AS "imageUrl", e.creator, e.date, 
              e.collection, e.culture, e.medium, 
              e.style_or_period AS "styleOrPeriod", e.location_created AS "locationCreated", e.description
       FROM exhibits e
       JOIN collection_exhibits ce ON e.id = ce.exhibit_id
       WHERE ce.collection_id = $1`,
      [collectionId]
    );

    res.status(200).json({
      collection: collectionResult.rows[0],
      exhibits: exhibitsResult.rows,
    });
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

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM collection_exhibits WHERE exhibit_id = $1",
      [exhibitId]
    );

    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query("DELETE FROM exhibits WHERE id = $1", [exhibitId]);
    }

    res.status(200).json({ message: "Exhibit removed from collection" });
  } catch (error) {
    console.error("Error removing exhibit:", error);
    next(error);
  }
};

export const deleteCollection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const collectionId = parseInt(req.params.id);

  try {
    await pool.query(
      "DELETE FROM collection_exhibits WHERE collection_id = $1",
      [collectionId]
    );

    const result = await pool.query(
      "DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING *",
      [collectionId, req.user.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    next(error);
  }
};
