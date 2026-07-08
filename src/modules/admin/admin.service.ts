import { prisma } from "../../config/prisma.js";
import { AppError } from "../../errors/AppError.js";

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

export const updateUserStatusService = async (
  userId: string,
  isBanned: boolean,
) => {
  // 1. Verify the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // 2. Safety Check: Prevent admins from banning self and other admins
  if (user.role === "ADMIN") {
    throw new AppError(
      403,
      "You cannot ban your own and another admin account",
    );
  }

  // 3. Update the status
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isBanned },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });

  return updatedUser;
};
