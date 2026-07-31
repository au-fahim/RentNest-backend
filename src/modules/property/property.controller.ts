import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../config/prisma.js";
import {
  createPropertyService,
  updatePropertyService,
  deletePropertyService,
  deletePropertyImageService,
  getAllPropertiesService,
  getPropertyByIdService,
  getLandlordPropertiesService,
} from "./property.service.js";
import {
  deleteImageByPublicId,
  uploadImageBuffer,
} from "../../config/cloudinary.js";

const parseUuidArray = (input: any): string[] => {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.flatMap((value) => parseUuidArray(value)).filter(Boolean);
  }

  if (typeof input === "string") {
    const value = input.trim();
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parseUuidArray(parsed);
      }

      if (typeof parsed === "string") {
        return parseUuidArray(parsed);
      }
    } catch {
      return value
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const parseBoolean = (input: any): boolean =>
  input === true || String(input).toLowerCase() === "true";

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

    // Normalize payload values when coming from multipart/form-data
    const payload: any = { ...req.body };

    if (payload.price !== undefined && payload.price !== "") {
      payload.price = Number(payload.price);
    }

    if (payload.isAvailable !== undefined && payload.isAvailable !== "") {
      payload.isAvailable = parseBoolean(payload.isAvailable);
    }

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

    // Normalize payload values
    const payload: any = { ...req.body };
    if (payload.price !== undefined && payload.price !== "") {
      payload.price = Number(payload.price);
    }

    if (payload.isAvailable !== undefined && payload.isAvailable !== "") {
      payload.isAvailable = parseBoolean(payload.isAvailable);
    }

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

    const removeImageIds = parseUuidArray(payload.removeImageIds);
    const replaceImageIds = parseUuidArray(payload.replaceImageIds);
    const clearImages = parseBoolean(payload.clearImages);

    if (clearImages && replaceImageIds.length > 0) {
      throw new AppError(
        400,
        "Cannot use replaceImageIds together with clearImages. Clear all existing images first, then upload new ones.",
      );
    }

    const replaceFiles =
      replaceImageIds.length > 0 ? files.slice(0, replaceImageIds.length) : [];
    const extraFiles = files.slice(replaceFiles.length);

    if (
      replaceFiles.length > 0 &&
      replaceFiles.length !== replaceImageIds.length
    ) {
      throw new AppError(
        400,
        "The number of replacement files must match the number of replaceImageIds.",
      );
    }

    const uploadedReplaceResults: { url: string; public_id: string }[] = [];
    const uploadedExtraResults: { url: string; public_id: string }[] = [];
    const uploadedImages: { url: string; public_id: string }[] = [];

    try {
      if (removeImageIds.length > 0 || replaceImageIds.length > 0) {
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
          select: {
            landlordId: true,
            images: { select: { id: true } },
          },
        });

        if (!property) {
          throw new AppError(404, "Property not found");
        }

        if (property.landlordId !== landlordId) {
          throw new AppError(403, "You can only update your own properties");
        }

        const existingImageIds = new Set(
          property.images.map((image) => image.id),
        );
        const requestedImageIds = [...removeImageIds, ...replaceImageIds];
        if (requestedImageIds.some((id) => !existingImageIds.has(id))) {
          throw new AppError(
            400,
            "One or more image IDs do not belong to this property.",
          );
        }
      }

      if (replaceFiles.length > 0) {
        for (const file of replaceFiles) {
          const uploaded = await uploadImageBuffer(file.buffer, file.mimetype);
          uploadedReplaceResults.push(uploaded);
          uploadedImages.push(uploaded);
        }
      }

      if (extraFiles.length > 0) {
        for (const file of extraFiles) {
          const uploaded = await uploadImageBuffer(file.buffer, file.mimetype);
          uploadedExtraResults.push(uploaded);
          uploadedImages.push(uploaded);
        }
      }

      if (removeImageIds.length > 0) {
        payload.removeImageIds = removeImageIds;
      }

      if (replaceImageIds.length > 0) {
        payload.replaceImageIds = replaceImageIds;
        payload.replaceImages = uploadedReplaceResults.map((r) => ({
          url: r.url,
          publicId: r.public_id,
        }));
      }

      if (uploadedExtraResults.length > 0) {
        payload.newImages = uploadedExtraResults.map((r) => ({
          url: r.url,
          publicId: r.public_id,
        }));
      }

      payload.clearImages = clearImages;
      const result = await updatePropertyService(
        propertyId,
        landlordId,
        payload,
      );

      res.status(200).json({
        success: true,
        message: "Property updated successfully",
        data: result,
      });
    } catch (error) {
      await Promise.all(
        uploadedImages.map((image) => deleteImageByPublicId(image.public_id)),
      );
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const deletePropertyImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const landlordId = req.user?.id as string;
    const propertyId = req.params.id as string;
    const imageId = req.params.imageId as string;

    await deletePropertyImageService(propertyId, imageId, landlordId);

    res.status(200).json({
      success: true,
      message: "Property image deleted successfully",
      data: null,
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
