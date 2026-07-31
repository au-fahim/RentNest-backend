import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { deleteImageByPublicId } from "../../config/cloudinary.js";

export const createPropertyService = async (
  landlordId: string,
  payload: any,
) => {
  // Normalize common payload values
  const price = payload.price !== undefined ? Number(payload.price) : undefined;
  const isAvailable =
    payload.isAvailable !== undefined
      ? payload.isAvailable === true ||
        String(payload.isAvailable).toLowerCase() === "true"
      : true;
  const amenities = Array.isArray(payload.amenities)
    ? payload.amenities
    : typeof payload.amenities === "string"
      ? payload.amenities
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : undefined;

  // Prepare images nested create if images provided as array of objects { url, publicId }
  const images =
    Array.isArray(payload.images) && payload.images.length > 0
      ? payload.images.map((img: any) => ({
          url: img.url,
          publicId: img.publicId,
        }))
      : undefined;

  const data: any = {
    title: payload.title,
    description: payload.description,
    price,
    location: payload.location,
    amenities,
    isAvailable,
    landlordId,
    categoryId: payload.categoryId,
  };

  if (images) {
    data.images = { create: images };
  }

  return await prisma.property.create({
    data,
    include: {
      category: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true, email: true } },
      images: { select: { id: true, url: true, publicId: true } },
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

  // If payload.images is an array, treat them as new images to create
  const imagesToCreate =
    Array.isArray(payload.images) && payload.images.length > 0
      ? payload.images.map((img: any) => ({
          url: img.url,
          publicId: img.publicId,
        }))
      : undefined;

  // Build the data to update, copying allowed fields
  const price = payload.price !== undefined ? Number(payload.price) : undefined;
  const isAvailable =
    payload.isAvailable !== undefined
      ? payload.isAvailable === true ||
        String(payload.isAvailable).toLowerCase() === "true"
      : undefined;
  const amenities = Array.isArray(payload.amenities)
    ? payload.amenities
    : typeof payload.amenities === "string"
      ? payload.amenities
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : undefined;

  const data: any = {};
  const updatableFields = ["title", "description", "location", "categoryId"];
  updatableFields.forEach((f) => {
    if (payload[f] !== undefined) data[f] = payload[f];
  });

  if (price !== undefined) {
    data.price = price;
  }

  if (isAvailable !== undefined) {
    data.isAvailable = isAvailable;
  }

  if (amenities !== undefined) {
    data.amenities = amenities;
  }

  if (imagesToCreate) {
    data.images = { create: imagesToCreate };
  }

  return await prisma.property.update({
    where: { id: propertyId },
    data,
    include: {
      category: { select: { id: true, name: true } },
      images: { select: { id: true, url: true, publicId: true } },
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

  const propertyImageClient = prisma as typeof prisma & {
    propertyImage: {
      findMany: (args: {
        where: { propertyId: string };
        select?: { publicId: true };
      }) => Promise<Array<{ publicId: string }>>;
      deleteMany: (args: { where: { propertyId: string } }) => Promise<unknown>;
    };
  };

  const propertyImages = await propertyImageClient.propertyImage.findMany({
    where: { propertyId },
    select: { publicId: true },
  });

  // Delete images from Cloudinary first (best-effort)
  if (propertyImages.length > 0) {
    for (const img of propertyImages) {
      try {
        await deleteImageByPublicId(img.publicId);
      } catch (err) {
        // swallow errors: log and continue
        // eslint-disable-next-line no-console
        console.error("Failed to delete cloud image", img.publicId, err);
      }
    }
  }

  await propertyImageClient.propertyImage.deleteMany({
    where: { propertyId },
  });

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
      images: { select: { id: true, url: true, publicId: true } },
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
      images: { select: { id: true, url: true, publicId: true } },
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
      images: { select: { id: true, url: true, publicId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return properties;
};
