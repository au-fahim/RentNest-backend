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
