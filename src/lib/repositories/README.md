# Database Abstraction Layer

This directory contains a structured repository pattern implementation that centralizes database access logic using Supabase's client.

## Overview

The database abstraction layer provides:

1. **Repository Pattern**: Entity-specific repositories for database operations
2. **Type Safety**: TypeScript interfaces generated from the database schema
3. **Caching**: In-memory caching for frequently accessed data
4. **Error Handling**: Consistent error handling across repositories

## Repository Structure

- `base-repository.ts`: Abstract base class with common CRUD operations
- `user-repository.ts`: Repository for User entities
- `project-repository.ts`: Repository for Project entities
- `expense-repository.ts`: Repository for Expense entities
- `repository-factory.ts`: Factory for creating cached repositories
- `index.ts`: Exports all repositories and cached versions

## Usage Examples

### Basic Repository Usage

```typescript
import { userRepository } from '@/lib/repositories';

// Find a user by ID
const user = await userRepository.findById('user-id');

// Find users by role
const admins = await userRepository.findByRole('admin');

// Create a new user
const newUser = await userRepository.create({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
});

// Update a user
const updatedUser = await userRepository.update('user-id', {
  name: 'John Smith'
});

// Delete a user
await userRepository.delete('user-id');
```

### Using Cached Repositories

```typescript
import { cachedProjectRepository } from '@/lib/repositories';

// Find a project (cached for 5 minutes)
const project = await cachedProjectRepository.findById('project-id');

// Create a project (automatically invalidates cache)
const newProject = await cachedProjectRepository.create({
  name: 'New Project',
  description: 'Project description',
  type: 'soundtrack',
  startDate: new Date().toISOString(),
  ownerId: 'user-id'
});
```

### Custom Repository Methods

Each repository includes entity-specific methods:

```typescript
// User repository
const user = await userRepository.findByEmail('user@example.com');
const verifiedUser = await userRepository.verifyPassword('email', 'password');

// Project repository
const projects = await projectRepository.findWithOwner();
const projectWithMembers = await projectRepository.findWithMembers('project-id');
const recentProjects = await projectRepository.findRecentForUser('user-id', 5);

// Expense repository
const expenses = await expenseRepository.findWithProjectByUserId('user-id');
const summary = await expenseRepository.getSummaryByCategory('user-id');
```

## Extending with New Repositories

To create a new repository:

1. Create a new file (e.g., `task-repository.ts`)
2. Extend the `BaseRepository` class
3. Add entity-specific methods
4. Export a singleton instance
5. Add it to `index.ts`

Example:

```typescript
import { BaseRepository } from './base-repository';
import { Database } from '@/types/supabase';

export type Task = Database['public']['Tables']['Task']['Row'];
export type TaskInsert = Database['public']['Tables']['Task']['Insert'];
export type TaskUpdate = Database['public']['Tables']['Task']['Update'];

export class TaskRepository extends BaseRepository<Task, TaskInsert, TaskUpdate> {
  constructor() {
    super('Task');
  }
  
  // Add custom methods here
  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.findByField('projectId', projectId);
  }
}

export const taskRepository = new TaskRepository();
```

## Supabase Integration

The repositories use Supabase's client to interact with the database. This provides:

1. **Type Safety**: TypeScript types for database tables
2. **Query Building**: Supabase's query builder for complex queries
3. **Relationships**: Easy handling of relationships between entities
4. **Error Handling**: Consistent error handling

## Authentication

The `auth-supabase.ts` file provides integration with Supabase Auth, which can be used to replace the current NextAuth implementation.

## Caching

The `memory-cache.ts` file provides a simple in-memory caching implementation that can be used with repositories to improve performance.