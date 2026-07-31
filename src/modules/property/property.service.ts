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
    if (images.length > 6) {
      throw new AppError(400, "A property can have at most 6 images.");
    }
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
    include: { images: true },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(403, "You can only update your own properties");
  }

  const clearImages = payload.clearImages === true;
  const removeImageIds = Array.isArray(payload.removeImageIds)
    ? payload.removeImageIds.map(String).filter(Boolean)
    : [];
  const replaceImageIds = Array.isArray(payload.replaceImageIds)
    ? payload.replaceImageIds.map(String).filter(Boolean)
    : [];
  const replaceImages = Array.isArray(payload.replaceImages)
    ? payload.replaceImages.map((img: any) => ({
        url: img.url,
        publicId: img.publicId,
      }))
    : [];
  const newImages = Array.isArray(payload.newImages)
    ? payload.newImages.map((img: any) => ({
        url: img.url,
        publicId: img.publicId,
      }))
    : [];

  if (clearImages && replaceImageIds.length > 0) {
    throw new AppError(
      400,
      "Cannot use replaceImageIds together with clearImages. Clear all images first, then upload new ones.",
    );
  }

  if (replaceImageIds.length > replaceImages.length) {
    throw new AppError(
      400,
      "The number of replacement file uploads must match the number of replaceImageIds.",
    );
  }

  const existingImages = property.images ?? [];
  const existingImageIds = new Set(existingImages.map((img: any) => img.id));

  if (removeImageIds.some((id: string) => !existingImageIds.has(id))) {
    throw new AppError(
      400,
      "One or more removeImageIds do not belong to this property.",
    );
  }

  if (replaceImageIds.some((id: string) => !existingImageIds.has(id))) {
    throw new AppError(
      400,
      "One or more replaceImageIds do not belong to this property.",
    );
  }

  const deletedIds = new Set<string>();
  if (clearImages) {
    existingImages.forEach((img: any) => deletedIds.add(img.id));
  } else {
    removeImageIds.forEach((id: string) => deletedIds.add(id));
    replaceImageIds.forEach((id: string) => deletedIds.add(id));
  }

  const remainingCount = clearImages
    ? 0
    : existingImages.length - deletedIds.size;
  const totalNewImages = replaceImages.length + newImages.length;

  if (remainingCount + totalNewImages > 6) {
    throw new AppError(
      400,
      `Image limit exceeded. A property may have at most 6 images. After this update, it would have ${remainingCount + totalNewImages} images.`,
    );
  }

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

  const allNewImages = [...replaceImages, ...newImages];
  if (allNewImages.length > 0) {
    data.images = { create: allNewImages };
  }

  const result = await prisma.$transaction(async (tx) => {
    if (deletedIds.size > 0) {
      await tx.propertyImage.deleteMany({
        where: {
          id: { in: Array.from(deletedIds) },
        },
      });
    }

    return tx.property.update({
      where: { id: propertyId },
      data,
      include: {
        category: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, publicId: true } },
      },
    });
  });

  const imagesToDelete = existingImages.filter((img: any) =>
    deletedIds.has(img.id),
  );
  await Promise.all(
    imagesToDelete.map((image) => deleteImageByPublicId(image.publicId)),
  );

  return result;
};

export const deletePropertyImageService = async (
  propertyId: string,
  imageId: string,
  landlordId: string,
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { images: true },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(
      403,
      "You can only modify images for your own properties",
    );
  }

  const image = property.images.find((img: any) => img.id === imageId);

  if (!image) {
    throw new AppError(404, "Property image not found");
  }

  try {
    await deleteImageByPublicId(image.publicId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to delete cloud image", image.publicId, err);
  }

  await prisma.propertyImage.delete({
    where: { id: imageId },
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
