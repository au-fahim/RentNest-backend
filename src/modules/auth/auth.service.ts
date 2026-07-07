import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../config/prisma.js";

export const registerUserService = async (payload: any) => {
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(409, "User with this email already exists");
  }

  // 2. Hash the password securely
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // 3. Create the user in the database
  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
};

export const loginUserService = async (payload: any) => {
  // 1. Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  // 2. Check if user is banned
  if (user.isBanned) {
    throw new AppError(403, "Your account has been banned by an administrator");
  }

  // 3. Verify the password
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  // 4. Generate the JWT Token
  const jwtSecret = process.env.JWT_ACCESS_SECRET as string;
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
        "7d") as jwt.SignOptions["expiresIn"],
    },
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
};
