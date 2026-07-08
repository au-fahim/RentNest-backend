import { Request, Response, NextFunction } from "express";
import {
  createRentalRequestService,
  getTenantRentalRequestsService,
} from "./rentalRequest.service.js";

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

export const getTenantRentalRequestsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract the tenant ID securely from the auth middleware
    const tenantId = req.user?.id as string;

    const result = await getTenantRentalRequestsService(tenantId);

    res.status(200).json({
      success: true,
      message: "Rental requests retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
