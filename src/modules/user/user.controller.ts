import { Request, Response, NextFunction } from "express";
import { getUserProfileService } from "./user.service.js";

export const getUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    const result = await getUserProfileService(userId);

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
