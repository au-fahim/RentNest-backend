import { Request, Response, NextFunction } from "express";
import { createReviewService } from "./review.service.js";

export const createReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.user?.id as string;

    const result = await createReviewService(tenantId, req.body);

    res.status(201).json({
      success: true,
      message: "Review successfully submitted",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
