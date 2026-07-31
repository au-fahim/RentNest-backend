import { Request, Response, NextFunction } from "express";
import {
  createPropertyService,
  updatePropertyService,
  deletePropertyService,
  getAllPropertiesService,
  getPropertyByIdService,
  getLandlordPropertiesService,
} from "./property.service.js";
import { uploadImageBuffer } from "../../config/cloudinary.js";

export const createPropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract landlord ID from authenticated user token
    const landlordId = req.user?.id as string;

    // Handle file uploads (multer stores files in memory)
    const files = (req.files as Express.Multer.File[]) || [];

    let uploadedResults: { url: string; public_id: string }[] = [];
    if (files.length > 0) {
      uploadedResults = await Promise.all(
        files.map(async (file) =>
          uploadImageBuffer(file.buffer, file.mimetype),
        ),
      );
    }

    // Normalize amenities when coming from multipart/form-data
    const payload: any = { ...req.body };

    if (payload.amenities) {
      if (typeof payload.amenities === "string") {
        try {
          payload.amenities = JSON.parse(payload.amenities);
        } catch (err) {
          payload.amenities = String(payload.amenities)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }

    if (uploadedResults.length > 0) {
      // Convert to the shape expected by service: { url, publicId }
      payload.images = uploadedResults.map((r) => ({
        url: r.url,
        publicId: r.public_id,
      }));
    }

    const result = await createPropertyService(landlordId, payload);

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

    // Handle file uploads
    const files = (req.files as Express.Multer.File[]) || [];

    let uploadedResults: { url: string; public_id: string }[] = [];
    if (files.length > 0) {
      uploadedResults = await Promise.all(
        files.map(async (file) =>
          uploadImageBuffer(file.buffer, file.mimetype),
        ),
      );
    }

    // Normalize amenities
    const payload: any = { ...req.body };
    if (payload.amenities) {
      if (typeof payload.amenities === "string") {
        try {
          payload.amenities = JSON.parse(payload.amenities);
        } catch (err) {
          payload.amenities = String(payload.amenities)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }

    // Merge with existing images if any (only append newly uploaded images)
    if (uploadedResults.length > 0) {
      const existingProperty = await getPropertyByIdService(propertyId);
      const existingImages = (existingProperty as any).images || [];
      // existingImages are objects { url, publicId }
      const newImages = uploadedResults.map((r) => ({
        url: r.url,
        publicId: r.public_id,
      }));
      // For update, service expects payload.images as array of objects to create
      payload.images = newImages;
      // leave existing images untouched — service will create new ones and return the full property
    }

    const result = await updatePropertyService(propertyId, landlordId, payload);

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
