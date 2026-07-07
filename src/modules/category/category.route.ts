import { Router } from "express";
import {
  createCategoryController,
  getAllCategoriesController,
} from "./category.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCategoryZodSchema } from "./category.validation.js";
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

export const CategoryRoutes = router;
