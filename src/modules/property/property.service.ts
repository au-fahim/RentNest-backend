import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const createPropertyService = async (
  landlordId: string,
  payload: any,
) => {
  return await prisma.property.create({
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
};

export const updatePropertyService = async (
  propertyId: string,
  landlordId: string,
  payload: any,
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "You can only update your own properties");
  }

  return await prisma.property.update({
    where: { id: propertyId },
    data: payload,
    include: {
      category: { select: { id: true, name: true } },
    },
  });
};

export const deletePropertyService = async (
  propertyId: string,
  landlordId: string,
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      rentalRequests: {
        where: { status: { in: ["PENDING", "APPROVED", "ACTIVE"] } },
        select: { id: true },
      },
    },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "You can only delete your own properties");
  }

  if (property.rentalRequests.length > 0) {
    throw new AppError(
      400,
      "You cannot delete a property with open rental requests",
    );
  }

  return await prisma.property.delete({
    where: { id: propertyId },
  });
};

export const getAllPropertiesService = async (query: any) => {
  const { searchTerm, categoryId, minPrice, maxPrice, location, amenities } =
    query;

  const whereConditions: any = {
    isAvailable: true,
  };

  if (searchTerm) {
    whereConditions.OR = [
      { title: { contains: searchTerm as string, mode: "insensitive" } },
      { description: { contains: searchTerm as string, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    whereConditions.categoryId = categoryId as string;
  }

  if (location) {
    whereConditions.location = {
      contains: location as string,
      mode: "insensitive",
    };
  }

  if (minPrice || maxPrice) {
    whereConditions.price = {};
    if (minPrice) whereConditions.price.gte = Number(minPrice);
    if (maxPrice) whereConditions.price.lte = Number(maxPrice);
  }

  if (amenities) {
    const amenitiesList = Array.isArray(amenities)
      ? amenities
      : String(amenities)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    if (amenitiesList.length > 0) {
      whereConditions.amenities = {
        hasEvery: amenitiesList,
      };
    }
  }

  return await prisma.property.findMany({
    where: whereConditions,
    include: {
      category: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getPropertyByIdService = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      category: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true, email: true } },
      reviews: {
        include: {
          tenant: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  return property;
};

export const getLandlordPropertiesService = async (landlordId: string) => {
  const properties = await prisma.property.findMany({
    where: {
      landlordId: landlordId,
    },
    include: {
      category: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return properties;
};
