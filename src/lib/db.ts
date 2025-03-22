import { Pool } from 'pg';

// Check if we're in a build environment
const isVercelBuild = process.env.NEXT_PHASE === 'phase-production-build' ||
                      process.env.NEXT_SKIP_INITIALIZING_DB === 'true';

// Configure PostgreSQL connection pooling
const db = (() => {
  if (isVercelBuild) {
    console.log("🔄 Skipping database connection initialization during Vercel build");
    return null as unknown as Pool; // Use 'Pool' type here
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
})();

// Export db with runtime checks
export { db };