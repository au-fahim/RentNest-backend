import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const getUserProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User profile not found");
  }

  return user;
};

export const updateProfileService = async (userId: string, payload: any) => {
  // 1. Check if user already exists
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(400, "User with this email already exists");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });
  return updatedUser;
};
