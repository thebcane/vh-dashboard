import { Pool, PoolConfig } from 'pg';

/**
 * Connection pool configuration for PostgreSQL
 * These settings are optimized for a serverless environment
 */
export const createConnectionPool = (config?: Partial<PoolConfig>): Pool => {
  // Check if we're in a build environment
  const isVercelBuild = process.env.NEXT_PHASE === 'phase-production-build' ||
                        process.env.NEXT_SKIP_INITIALIZING_DB === 'true';
  
  if (isVercelBuild) {
    console.log("🔄 Skipping database connection initialization during Vercel build");
    return null as unknown as Pool;
  }

  // Default configuration optimized for serverless environments
  const defaultConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    
    // Connection pool settings
    max: 10,                 // Maximum number of clients in the pool
    min: 2,                  // Minimum number of idle clients maintained in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    
    // Connection timeout settings
    connectionTimeoutMillis: 5000, // Maximum time to wait for a connection
    
    // Query timeout settings
    statement_timeout: 10000, // Maximum time for a query to execute (10 seconds)
    
    // SSL settings for secure connections
    ssl: process.env.NODE_ENV === 'production' ? 
      { rejectUnauthorized: true } : 
      undefined,
  };

  // Merge default config with provided config
  const poolConfig = { ...defaultConfig, ...config };
  
  // Create and return the connection pool
  return new Pool(poolConfig);
};

/**
 * Singleton connection pool instance
 */
export const db = createConnectionPool();

/**
 * Health check function for the database connection
 * @returns True if the database is connected, false otherwise
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = await db.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Retry a database operation with exponential backoff
 * @param operation The database operation to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay in milliseconds
 * @returns The result of the operation
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if the error is retryable
      if (
        error instanceof Error && 
        (
          // Connection errors
          error.message.includes('connection') ||
          error.message.includes('timeout') ||
          // Temporary errors
          error.message.includes('temporarily unavailable') ||
          error.message.includes('too many clients')
        )
      ) {
        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Database operation failed, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Non-retryable error
      throw error;
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Operation failed after maximum retries');
}