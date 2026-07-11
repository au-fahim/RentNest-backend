import { Router } from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from "./category.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  categoryIdParamZodSchema,
  createCategoryZodSchema,
  updateCategoryZodSchema,
} from "./category.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

// Endpoint: GET /api/categories (Public)
router.get("/", getAllCategoriesController);

// Endpoint: POST /api/categories (Protected: Admin Only)
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(createCategoryZodSchema),
  createCategoryController,
);

// Endpoint: PATCH /api/categories/:id (Protected: Admin Only)
router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(updateCategoryZodSchema),
  updateCategoryController,
);

// Endpoint: DELETE /api/categories/:id (Protected: Admin Only)
router.delete(
  "/:id",
  auth("ADMIN"),
  validateRequest(categoryIdParamZodSchema),
  deleteCategoryController,
);

export const CategoryRoutes = router;
