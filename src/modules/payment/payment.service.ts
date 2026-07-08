import Stripe from "stripe";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createPaymentIntentService = async (
  tenantId: string,
  rentalRequestId: string,
) => {
  // 1. Verify the rental request
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new AppError(404, "Rental request not found");
  }

  // 2. Security Checks
  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "You can only pay for your own rental requests");
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new AppError(
      400,
      "You can only make a payment for an APPROVED rental request",
    );
  }

  if (rentalRequest.payment) {
    throw new AppError(
      400,
      "A payment has already been initiated or completed for this request",
    );
  }

  // 3. Create Stripe Payment Intent
  const amountToPay = rentalRequest.property.price;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountToPay * 100), // Stripe strictly processes amounts in cents
    currency: "usd",
    metadata: {
      rentalRequestId: rentalRequest.id,
      tenantId: tenantId,
    },
  });

  // 4. Create Pending Payment Record in database
  const paymentRecord = await prisma.payment.create({
    data: {
      amount: amountToPay,
      transactionId: paymentIntent.id,
      method: "card",
      provider: "Stripe",
      status: "PENDING",
      rentalRequestId: rentalRequest.id,
    },
  });

  // Return client_secret so frontend can complete transaction later
  return {
    paymentId: paymentRecord.id,
    transactionId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  };
};
