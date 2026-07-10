import { Request, Response, NextFunction } from "express";
import {
  createPropertyService,
  updatePropertyService,
  deletePropertyService,
  getAllPropertiesService,
  getPropertyByIdService,
  getLandlordPropertiesService,
} from "./property.service.js";

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

export const getLandlordPropertiesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // req.user is populated by your auth middleware
    const landlordId = req.user?.id as string;

    const result = await getLandlordPropertiesService(landlordId);

    res.status(200).json({
      success: true,
      message: "Your properties were retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const landlordId = req.user?.id as string;
    const propertyId = req.params.id as string;

    const result = await updatePropertyService(
      propertyId,
      landlordId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const landlordId = req.user?.id as string;
    const propertyId = req.params.id as string;

    await deletePropertyService(propertyId, landlordId);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
      data: null, // Deletions typically return null data
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPropertiesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllPropertiesService(req.query);

    res.status(200).json({
      success: true,
      message: "Properties retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.id as string;
    const result = await getPropertyByIdService(propertyId);

    res.status(200).json({
      success: true,
      message: "Property details retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
