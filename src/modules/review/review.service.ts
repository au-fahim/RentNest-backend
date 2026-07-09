import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const createReviewService = async (tenantId: string, payload: any) => {
  const { propertyId, rating, comment } = payload;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  const completedRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: "COMPLETED",
      payment: {
        status: "COMPLETED",
      },
    },
  });

  if (!completedRental) {
    throw new AppError(
      403,
      "You can only leave a review after a completed and paid rental",
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      tenantId,
      propertyId,
    },
  });

  if (existingReview) {
    throw new AppError(400, "You have already reviewed this property");
  }

  return await prisma.review.create({
    data: {
      tenantId,
      propertyId,
      rating,
      comment,
    },
    include: {
      tenant: {
        select: { id: true, name: true },
      },
      property: {
        select: { id: true, title: true },
      },
    },
  });
};
