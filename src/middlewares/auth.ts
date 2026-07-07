import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { prisma } from "../config/prisma.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const auth = (...requiredRoles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(401, "You are not authorized to access this route");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new AppError(401, "You are not authorized to access this route");
      }

      // Verify token
      const secret = process.env.JWT_ACCESS_SECRET as string;
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Verify user still exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError(
          401,
          "The user belonging to this token no longer exists",
        );
      }

      if (user.isBanned) {
        throw new AppError(
          403,
          "Your account has been banned by an administrator",
        );
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError(
          403,
          "You do not have the required permissions to perform this action",
        );
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new AppError(401, "Invalid token. Please log in again"));
      } else if (error instanceof jwt.TokenExpiredError) {
        next(new AppError(401, "Your token has expired. Please log in again"));
      } else {
        next(error);
      }
    }
  };
};
