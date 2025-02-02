import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface DecodedUser {
  id: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
}

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied, token missing!" });
    return; // 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedUser;
    req.user = decoded;
    next(); 
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
    return; 
  }
};
