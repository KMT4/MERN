import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


// custom request type
export interface AuthRequest extends Request {
  userId?: string;
}


export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  try {

    const authHeader = req.headers.authorization;

    // check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Not authorized"
      });
      return;
    }

    // extract token
    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    // attach userId to request
    req.userId = decoded.userId;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }
};