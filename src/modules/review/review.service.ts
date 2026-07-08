import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const createReviewService = async (tenantId: string, payload: any) => {
  const { propertyId, rating, comment } = payload;

  // 1. Verify the property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found");
  }

  // check if there is at least one APPROVED rental request for this tenant & property
  const hasRented = await prisma.rentalRequest.findFirst({
    where: {
      tenantId: tenantId,
      propertyId: propertyId,
      status: "APPROVED",
    },
  });

  if (!hasRented) {
    throw new AppError(
      403,
      "You can only leave a review for properties you have successfully rented",
    );
  }

  // 3. Prevent duplicate reviews (one review per property per tenant)
  const existingReview = await prisma.review.findFirst({
    where: {
      tenantId: tenantId,
      propertyId: propertyId,
    },
  });

  if (existingReview) {
    throw new AppError(400, "You have already reviewed this property");
  }

  // 4. Create the review
  const newReview = await prisma.review.create({
    data: {
      tenantId,
      propertyId,
      rating,
      comment,
    },
    include: {
      tenant: {
        select: { name: true },
      },
    },
  });

  return newReview;
};
