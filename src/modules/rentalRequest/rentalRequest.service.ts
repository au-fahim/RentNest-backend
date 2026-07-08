import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const createRentalRequestService = async (
  tenantId: string,
  payload: any,
) => {
  // 1. Check if the property exists and is actually available
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  if (!property.isAvailable) {
    throw new AppError(
      400,
      "This property is currently not available for rent",
    );
  }

  // 2. Create the rental request (status defaults to PENDING in our schema)
  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate,
      moveOutDate: payload.moveOutDate,
    },
    // Include some property details in the response so the tenant sees what they requested
    include: {
      property: {
        select: { title: true, location: true, price: true },
      },
    },
  });

  return rentalRequest;
};

export const getTenantRentalRequestsService = async (tenantId: string) => {
  const rentalRequests = await prisma.rentalRequest.findMany({
    where: { tenantId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rentalRequests;
};
