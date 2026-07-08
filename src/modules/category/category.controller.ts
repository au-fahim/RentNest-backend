import { Request, Response, NextFunction } from "express";
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  updateCategoryService,
} from "./category.service.js";

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createCategoryService(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllCategoriesService();

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryId = req.params.id as string;
    const result = await updateCategoryService(categoryId, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryId = req.params.id as string;
    await deleteCategoryService(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
