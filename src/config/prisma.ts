import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// Grab and sanitize the standard Postgres URL
let dbUrl = process.env.DATABASE_URL || "";
dbUrl = dbUrl.replace(/^["']|["']$/g, "").trim();

// console.log(
//   "🔌 Initializing Prisma with PostgreSQL Adapter for:",
//   dbUrl.substring(0, 30) + "...",
// );

// Ultimate Safety Check for standard postgres URL
if (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://")) {
  console.error("❌ CRITICAL: Expected a standard postgres:// URL!");
  process.exit(1);
}

// Set up the native Node.js PostgreSQL connection pool
const pool = new Pool({ connectionString: dbUrl });

// Wrap the pool in Prisma's modern Driver Adapter
const adapter = new PrismaPg(pool);

// Initialize the modern client using the Adapter
export const prisma = new PrismaClient({
  adapter,
});
