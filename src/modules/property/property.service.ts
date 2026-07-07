import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const createPropertyService = async (
  landlordId: string,
  payload: any,
) => {
  const newProperty = await prisma.property.create({
    data: {
      ...payload,
      landlordId,
    },

    include: {
      category: {
        select: { id: true, name: true },
      },
      landlord: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return newProperty;
};

export const updatePropertyService = async (
  propertyId: string,
  landlordId: string,
  payload: any,
) => {
  // 1. Check if property exists and belongs to this landlord
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "You can only update your own properties");
  }

  // 2. Perform the update
  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return updatedProperty;
};

export const deletePropertyService = async (
  propertyId: string,
  landlordId: string,
) => {
  // 1. Check if property exists and belongs to this landlord
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "You can only delete your own properties");
  }

  // 2. Perform the deletion
  const deletedProperty = await prisma.property.delete({
    where: { id: propertyId },
  });

  return deletedProperty;
};