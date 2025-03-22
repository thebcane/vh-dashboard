# VH Dashboard Database Layer

This directory contains the core database infrastructure for the VH Dashboard application, including the database abstraction layer, connection pool, caching system, and authentication integration.

## Overview

The database layer has been redesigned to provide:

1. **Repository Pattern**: Entity-specific repositories for centralized database access
2. **Type Safety**: TypeScript interfaces generated from the database schema
3. **Caching**: In-memory caching for frequently accessed data
4. **Connection Pool Optimization**: Fine-tuned connection settings for serverless environments
5. **Supabase Integration**: Leveraging Supabase's client for database operations and authentication

## Directory Structure

- `/repositories`: Repository pattern implementation for database entities
- `/database`: Connection pool and database utilities
- `/cache`: Caching implementation for improved performance
- `/supabase`: Supabase client configuration and utilities

## Repository Pattern

The repository pattern centralizes database access logic and provides a consistent API for working with database entities. Each entity has its own repository with type-safe methods for common operations.

```typescript
// Example: Using the expense repository
import { expenseRepository } from '@/lib/repositories';

// Get all expenses for a user with project information
const expenses = await expenseRepository.findWithProjectByUserId(userId);

// Create a new expense
const newExpense = await expenseRepository.create({
  title: 'New Expense',
  amount: 100,
  category: 'Equipment',
  date: new Date().toISOString(),
  userId: currentUser.id,
});
```

See the [repositories README](./repositories/README.md) for more details.

## Connection Pool Optimization

The connection pool is optimized for serverless environments with settings for connection limits, timeouts, and retry logic.

```typescript
// Example: Using the retry operation utility
import { retryOperation } from '@/lib/database/connection-pool';

const result = await retryOperation(async () => {
  // Database operation that might fail due to connection issues
  return db.query('SELECT * FROM users WHERE id = $1', [userId]);
});
```

See the [database README](./database/README.md) for more details.

## Caching System

The caching system provides in-memory caching for frequently accessed data with automatic invalidation when data changes.

```typescript
// Example: Using cached repositories
import { cachedUserRepository } from '@/lib/repositories';

// Get a user (cached for 5 minutes)
const user = await cachedUserRepository.findById(userId);
```

## Supabase Integration

The Supabase client is configured for both client-side and server-side usage, with support for authentication and database operations.

```typescript
// Example: Using the Supabase client
import { supabaseAdmin } from '@/lib/supabase/client';

// Query the database
const { data, error } = await supabaseAdmin()
  .from('User')
  .select('*')
  .eq('id', userId);
```

## Authentication

The authentication system is integrated with Supabase Auth, providing a secure and scalable solution for user authentication.

```typescript
// Example: Using Supabase Auth
import { supabaseAuth } from '@/lib/auth-supabase';

// Sign in a user
const { data, error } = await supabaseAuth.signIn(email, password);
```

## API Routes

The API routes have been updated to use the repository pattern, providing a consistent and type-safe way to interact with the database.

```typescript
// Example: API route using repositories
import { expenseRepository } from '@/lib/repositories';

export async function GET() {
  const expenses = await expenseRepository.findAll();
  return NextResponse.json({ expenses });
}
```

## Type Safety

The database layer provides type safety through TypeScript interfaces generated from the database schema.

```typescript
// Example: Type-safe entity interfaces
import { User, Project, Expense } from '@/lib/repositories';

function processUser(user: User) {
  // Type-safe access to user properties
  console.log(user.name, user.email);
}
```

## Best Practices

1. **Use Repositories**: Always use repositories for database access
2. **Leverage Caching**: Use cached repositories for frequently accessed data
3. **Handle Errors**: Properly handle database errors in API routes
4. **Use Types**: Leverage the type system for safer code
5. **Monitor Performance**: Use the database health check endpoint to monitor performance