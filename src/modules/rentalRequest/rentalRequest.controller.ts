import { Request, Response, NextFunction } from "express";
import {
  createRentalRequestService,
  getLandlordRequestsService,
  getTenantRentalRequestsService,
  updateRentalRequestStatusService,
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

export const getLandlordRequestsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const landlordId = req.user?.id as string;
    const result = await getLandlordRequestsService(landlordId);

    res.status(200).json({
      success: true,
      message: "Rental requests retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRentalRequestStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const landlordId = req.user?.id as string;
    const requestId = req.params.id as string;
    const { status } = req.body;

    const result = await updateRentalRequestStatusService(
      requestId,
      landlordId,
      status,
    );

    res.status(200).json({
      success: true,
      message: `Rental request ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
