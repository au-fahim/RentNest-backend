import { Request, Response, NextFunction } from "express";
import {
  getAllPropertiesAdminService,
  getAllRentalsAdminService,
  getAllUsersService,
  updateUserStatusService,
} from "./admin.service.js";

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllUsersService();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id as string;
    const { isBanned } = req.body;

    const result = await updateUserStatusService(userId, isBanned);

    res.status(200).json({
      success: true,
      message: `User successfully ${isBanned ? "banned" : "unbanned"}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPropertiesAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllPropertiesAdminService();
    res
      .status(200)
      .json({
        success: true,
        message: "Properties retrieved successfully",
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const getAllRentalsAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllRentalsAdminService();
    res
      .status(200)
      .json({
        success: true,
        message: "Rentals retrieved successfully",
        data: result,
      });
  } catch (error) {
    next(error);
  }
};
