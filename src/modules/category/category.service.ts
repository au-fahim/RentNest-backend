import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const createCategoryService = async (payload: {
  name: string;
  description?: string;
}) => {
  // Check if category name already exists
  const existingCategory = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existingCategory) {
    throw new AppError(409, "A category with this name already exists");
  }

  const newCategory = await prisma.category.create({
    data: payload,
  });

  return newCategory;
};

export const getAllCategoriesService = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return categories;
};

export const updateCategoryService = async (
  categoryId: string,
  payload: any,
) => {
  // 1. Verify category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new AppError(404, "Category not found");
  }

  // 2. Perform the update
  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: payload,
  });

  return updatedCategory;
};

export const deleteCategoryService = async (categoryId: string) => {
  // 1. Verify category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new AppError(404, "Category not found");
  }

  // 2. Perform the deletion
  await prisma.category.delete({
    where: { id: categoryId },
  });

  return null;
};
