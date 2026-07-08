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

export const confirmPaymentService = async (
  tenantId: string,
  payload: { paymentId: string; stripePaymentIntentId: string },
) => {
  // 1. Find the pending payment in our database
  const payment = await prisma.payment.findUnique({
    where: { id: payload.paymentId },
    include: { rentalRequest: true },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found");
  }

  if (payment.rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "You can only confirm your own payments");
  }

  if (payment.status === "COMPLETED") {
    throw new AppError(400, "This payment has already been completed");
  }

  // 2. Verify the status directly with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(
    payload.stripePaymentIntentId,
  );

  // 3. Update our database to mark it as Paid
  const updatedPayment = await prisma.payment.update({
    where: { id: payload.paymentId },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
    },
  });

  return updatedPayment;
};

export const getTenantPaymentHistoryService = async (tenantId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      // Look for payments where the associated rental request belongs to this tenant
      rentalRequest: {
        tenantId: tenantId,
      },
    },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: { title: true, location: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

export const getPaymentDetailsService = async (
  tenantId: string,
  paymentId: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: { title: true, location: true, price: true },
          },
          landlord: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found");
  }

  // Security Check: Ensure this tenant actually owns this payment record
  if (payment.rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "You can only view your own payment details");
  }

  return payment;
};
