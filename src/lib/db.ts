import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// We use a custom key to prevent creating database connections during Vercel's build phase
const isVercelBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_SKIP_INITIALIZING_DB === 'true';

// Configure Prisma Client with connection pooling in production
const prismaClientSingleton = () => {
  if (isVercelBuild) {
    console.log("🔄 Skipping Prisma client initialization during Vercel build");
    return null as unknown as PrismaClient;
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL,
      },
    },
  });
};

// Use global client if available, otherwise create a new one
const db = globalForPrisma.prisma || prismaClientSingleton();

// Save client to global in non-production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Export db with runtime checks
export { db };