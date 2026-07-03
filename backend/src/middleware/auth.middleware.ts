import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  console.log("URL:", req.originalUrl);
  console.log("Authorization:", req.headers.authorization);

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("TOKEN:", token);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.user = decoded;

    next();
  } catch (error) {
  console.log("TOKEN VALIDATION FAILED");
  console.log(error);

  return res.status(401).json({
    message: "Invalid token",
  });
}
};