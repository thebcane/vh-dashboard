# Database Connection Pool

This directory contains the database connection pool configuration and utilities for optimizing database performance in the VH Dashboard application.

## Overview

The connection pool implementation provides:

1. **Optimized Connection Settings**: Fine-tuned connection pool settings for serverless environments
2. **Retry Mechanism**: Automatic retry with exponential backoff for transient database errors
3. **Health Checks**: Database connection health monitoring
4. **Timeout Management**: Connection and query timeout settings to prevent hanging requests

## Files

- `connection-pool.ts`: Main implementation of the connection pool with retry logic and health checks

## Connection Pool Configuration

The connection pool is configured with the following default settings:

```typescript
{
  max: 10,                    // Maximum number of clients in the pool
  min: 2,                     // Minimum number of idle clients maintained in the pool
  idleTimeoutMillis: 30000,   // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // Maximum time to wait for a connection
  statement_timeout: 10000,   // Maximum time for a query to execute (10 seconds)
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: true } : 
    undefined,
}
```

These settings are optimized for serverless environments like Vercel, where connection management is critical for performance.

## Usage

### Basic Usage

```typescript
import { db } from '@/lib/database/connection-pool';

// Execute a query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### With Retry Logic

```typescript
import { retryOperation } from '@/lib/database/connection-pool';

// Execute a database operation with retry logic
const result = await retryOperation(async () => {
  return db.query('SELECT * FROM users WHERE id = $1', [userId]);
});
```

### Health Checks

```typescript
import { checkDatabaseHealth } from '@/lib/database/connection-pool';

// Check if the database is connected
const isHealthy = await checkDatabaseHealth();
```

## Retry Logic

The retry logic uses exponential backoff to retry operations that fail due to transient errors:

1. First retry: 100ms delay
2. Second retry: 200ms delay
3. Third retry: 400ms delay

Only certain types of errors are retried:
- Connection errors
- Timeout errors
- "Too many clients" errors
- "Temporarily unavailable" errors

Other errors (like syntax errors or constraint violations) are not retried and are thrown immediately.

## Integration with Repositories

The database connection pool is integrated with the repository pattern in the application:

```typescript
import { db, retryOperation } from '@/lib/database/connection-pool';

class UserRepository {
  async findById(id: string) {
    return retryOperation(async () => {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    });
  }
}
```

## Health Monitoring

The database health can be monitored using the `/api/db-health` endpoint, which checks both PostgreSQL and Supabase connections.

## Best Practices

1. **Use Parameterized Queries**: Always use parameterized queries to prevent SQL injection
2. **Release Connections**: Always release connections back to the pool when done
3. **Handle Timeouts**: Set appropriate timeouts for your queries
4. **Monitor Pool Usage**: Watch for "too many clients" errors, which indicate pool exhaustion
5. **Use Transactions**: Use transactions for operations that need to be atomic