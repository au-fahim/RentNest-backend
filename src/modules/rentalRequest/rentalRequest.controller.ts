import { Request, Response, NextFunction } from "express";
import { createRentalRequestService } from "./rentalRequest.service.js";

export const createRentalRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract the tenant ID securely from the auth middleware
    const tenantId = req.user?.id as string;

    const result = await createRentalRequestService(tenantId, req.body);

    res.status(201).json({
      success: true,
      message: "Rental request submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
