import { Request, Response, NextFunction } from "express";
import { createPaymentIntentService } from "./payment.service.js";

export const createPaymentIntentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.user?.id as string;
    const { rentalRequestId } = req.body;

    const result = await createPaymentIntentService(tenantId, rentalRequestId);

    res.status(201).json({
      success: true,
      message: "Payment intent created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
