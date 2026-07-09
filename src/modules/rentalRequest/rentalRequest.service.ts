import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const createRentalRequestService = async (
  tenantId: string,
  payload: any,
) => {
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

  if (property.landlordId === tenantId) {
    throw new AppError(400, "You cannot request to rent your own property");
  }

  const existingOpenRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
    },
  });

  if (existingOpenRequest) {
    throw new AppError(
      400,
      "You already have an open rental request for this property",
    );
  }

  return await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate,
      moveOutDate: payload.moveOutDate,
    },
    include: {
      property: {
        select: { id: true, title: true, location: true, price: true },
      },
    },
  });
};

export const getTenantRentalRequestsService = async (tenantId: string) => {
  return await prisma.rentalRequest.findMany({
    where: { tenantId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          isAvailable: true,
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          provider: true,
          status: true,
          paidAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getTenantRentalRequestByIdService = async (
  tenantId: string,
  requestId: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: {
      property: {
        include: {
          category: { select: { id: true, name: true } },
          landlord: { select: { id: true, name: true, email: true } },
        },
      },
      payment: true,
    },
  });

  if (!rentalRequest) {
    throw new AppError(404, "Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "You can only view your own rental requests");
  }

  return rentalRequest;
};

export const getLandlordRequestsService = async (landlordId: string) => {
  return await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
      },
    },
    include: {
      property: {
        select: { id: true, title: true, location: true, price: true },
      },
      tenant: { select: { id: true, name: true, email: true } },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          paidAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateRentalRequestStatusService = async (
  requestId: string,
  landlordId: string,
  status: "APPROVED" | "REJECTED" | "COMPLETED",
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true, payment: true },
  });

  if (!request) {
    throw new AppError(404, "Rental request not found");
  }

  if (request.property.landlordId !== landlordId) {
    throw new AppError(
      403,
      "You can only manage requests for your own properties",
    );
  }

  if (status === "COMPLETED") {
    if (request.status !== "ACTIVE") {
      throw new AppError(400, "Only active rentals can be marked as completed");
    }

    if (request.payment?.status !== "COMPLETED") {
      throw new AppError(
        400,
        "Rental cannot be completed before payment is completed",
      );
    }

    return await prisma.rentalRequest.update({
      where: { id: requestId },
      data: { status: "COMPLETED" },
      include: {
        property: { select: { id: true, title: true, location: true } },
        tenant: { select: { id: true, name: true, email: true } },
        payment: true,
      },
    });
  }

  if (request.status !== "PENDING") {
    throw new AppError(
      400,
      `This request has already been ${request.status.toLowerCase()}`,
    );
  }

  return await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status },
    include: {
      property: { select: { id: true, title: true, location: true } },
      tenant: { select: { id: true, name: true, email: true } },
    },
  });
};
