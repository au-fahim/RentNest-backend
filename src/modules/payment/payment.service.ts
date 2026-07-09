import Stripe from "stripe";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

const stripe = new Stripe(stripeSecretKey);

export const createPaymentIntentService = async (
  tenantId: string,
  rentalRequestId: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new AppError(404, "Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "You can only pay for your own rental requests");
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new AppError(
      400,
      "You can only make a payment for an APPROVED rental request",
    );
  }

  if (!rentalRequest.property.isAvailable) {
    throw new AppError(400, "This property is no longer available for rent");
  }

  if (rentalRequest.payment) {
    throw new AppError(
      400,
      "A payment has already been initiated or completed for this request",
    );
  }

  const amountToPay = rentalRequest.property.price;
  const amountInCents = Math.round(amountToPay * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    metadata: {
      rentalRequestId: rentalRequest.id,
      tenantId,
      paymentFor: "RentNest rental request",
    },
  });

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

  return {
    paymentId: paymentRecord.id,
    transactionId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    amount: paymentRecord.amount,
    provider: paymentRecord.provider,
    status: paymentRecord.status,
  };
};

export const confirmPaymentService = async (
  tenantId: string,
  payload: { paymentId: string; stripePaymentIntentId: string },
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: payload.paymentId },
    include: {
      rentalRequest: {
        include: {
          property: true,
        },
      },
    },
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

  if (payment.transactionId !== payload.stripePaymentIntentId) {
    throw new AppError(
      400,
      "Stripe payment intent ID does not match this payment record",
    );
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    payload.stripePaymentIntentId,
  );

  if (paymentIntent.status !== "succeeded") {
    throw new AppError(
      400,
      `Stripe payment is not completed yet. Current status: ${paymentIntent.status}`,
    );
  }

  if (paymentIntent.currency !== "usd") {
    throw new AppError(400, "Stripe payment currency does not match");
  }

  const expectedAmount = Math.round(payment.amount * 100);
  if (paymentIntent.amount_received !== expectedAmount) {
    throw new AppError(400, "Stripe paid amount does not match rental amount");
  }

  if (paymentIntent.metadata?.rentalRequestId !== payment.rentalRequestId) {
    throw new AppError(400, "Stripe metadata does not match rental request");
  }

  return await prisma.$transaction(async (tx) => {
    const paymentRecord = await tx.payment.update({
      where: { id: payload.paymentId },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
      },
      include: {
        rentalRequest: {
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
        },
      },
    });

    await tx.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    });

    await tx.property.update({
      where: { id: payment.rentalRequest.propertyId },
      data: { isAvailable: false },
    });

    return paymentRecord;
  });
};

export const getTenantPaymentHistoryService = async (tenantId: string) => {
  return await prisma.payment.findMany({
    where: {
      rentalRequest: {
        tenantId,
      },
    },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: { id: true, title: true, location: true, price: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
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
            include: {
              landlord: {
                select: { id: true, name: true, email: true },
              },
              category: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found");
  }

  if (payment.rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "You can only view your own payment details");
  }

  return payment;
};
