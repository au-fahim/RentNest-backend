import bcrypt from "bcrypt";
import "dotenv/config";
import { prisma } from "../config/prisma.js";

const seedAdmin = async () => {
  try {
    console.log("⏳ Checking database for existing admin...");

    // 1. Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists. Seeding skipped.");
      return;
    }

    // 2. Fetch credentials from .env
    const adminEmail = process.env.ADMIN_EMAIL as string;
    const adminPassword = process.env.ADMIN_PASSWORD as string;

    if (!adminEmail || !adminPassword) {
      throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file");
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // 4. Create the Admin user
    await prisma.user.create({
      data: {
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("🚀 Admin user seeded successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: (hidden for security)`);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
