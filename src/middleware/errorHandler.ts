import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ msg: "Not Found" });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.status && err.msg) {
    res.status(err.status).json({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).json({ msg: "Invalid Input" });
  } else if (err.code === "23503") {
    res.status(404).json({ msg: "User does not exist" });
  } else {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};
