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

export const getLandlordRequestsService = async (landlordId: string) => {
  // Find all requests where the associated property belongs to this landlord
  const requests = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId: landlordId,
      },
    },
    include: {
      property: { select: { title: true, location: true, price: true } },
      tenant: { select: { name: true, email: true } }, // Let the landlord see who is applying
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

export const updateRentalRequestStatusService = async (
  requestId: string,
  landlordId: string,
  status: "APPROVED" | "REJECTED",
) => {
  // 1. Find the request and include the property to check ownership
  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });

  if (!request) {
    throw new AppError(404, "Rental request not found");
  }

  // 2. Security Check: Does this landlord own this property?
  if (request.property.landlordId !== landlordId) {
    throw new AppError(
      403,
      "You can only manage requests for your own properties",
    );
  }

  // 3. Prevent updating requests that are already processed (optional but good practice)
  if (request.status !== "PENDING") {
    throw new AppError(
      400,
      `This request has already been ${request.status.toLowerCase()}`,
    );
  }

  // 4. Update the status
  const updatedRequest = await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return updatedRequest;
};
