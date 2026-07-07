import { Request, Response, NextFunction } from "express";
import { createPropertyService } from "./property.service.js";

export const createPropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract landlord ID from authenticated user token
    const landlordId = req.user?.id as string;

    const result = await createPropertyService(landlordId, req.body);

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
