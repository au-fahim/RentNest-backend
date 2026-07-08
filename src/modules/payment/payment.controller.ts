import { Request, Response, NextFunction } from "express";
import {
  confirmPaymentService,
  createPaymentIntentService,
  getPaymentDetailsService,
  getTenantPaymentHistoryService,
} from "./payment.service.js";

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

export const confirmPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.user?.id as string;

    const result = await confirmPaymentService(tenantId, req.body);

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTenantPaymentHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.user?.id as string;
    const result = await getTenantPaymentHistoryService(tenantId);

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.user?.id as string;
    const paymentId = req.params.id as string;

    const result = await getPaymentDetailsService(tenantId, paymentId);

    res.status(200).json({
      success: true,
      message: "Payment details retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};