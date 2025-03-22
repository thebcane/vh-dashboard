# Migration Plan: Fixing Errors and Implementing Supabase Auth

This document outlines a plan to address the current errors in the codebase and implement Supabase Auth as the authentication system.

## Current Issues

### 1. TypeScript Errors

1. **Missing Type Definitions**:
   - `Cannot find module '@/types/supabase'` - The Supabase type definitions are not being properly imported

2. **Cached Repository Method Access**:
   - `Property 'findWithProjectByUserId' does not exist on type 'CachedRepository'` - The cached repositories don't expose the custom methods from the underlying repositories

3. **Implicit Any Types**:
   - `Parameter 'e' implicitly has an 'any' type` - Type annotations are missing in some places

### 2. Spelling Warnings

- Various spelling warnings for technical terms like "Supabase", "serverless", and "Vercel" - These are false positives and can be ignored or added to a custom dictionary

## Fix Plan

### Phase 1: Fix TypeScript Errors

1. **Update Repository Factory**:
   ```typescript
   // Update repository-factory.ts to properly expose custom methods
   export class CachedRepository<T, I, U> {
     // Add a method to access the underlying repository
     getRepository(): BaseRepository<T, I, U> {
       return this.repository;
     }
     
     // Add dynamic method forwarding
     [key: string]: any;
     constructor(repository: BaseRepository<T, I, U>, prefix: string, defaultTtl: number) {
       this.repository = repository;
       this.prefix = prefix;
       this.defaultTtl = defaultTtl;
       
       // Forward all methods from the repository that aren't already defined
       Object.getOwnPropertyNames(Object.getPrototypeOf(repository))
         .filter(method => 
           method !== 'constructor' && 
           typeof repository[method] === 'function' &&
           !Object.getOwnPropertyNames(Object.getPrototypeOf(this)).includes(method)
         )
         .forEach(method => {
           this[method] = (...args: any[]) => repository[method](...args);
         });
     }
   }
   ```

2. **Fix API Routes**:
   - Update API routes to use the repository directly instead of the cached repository for methods that aren't in the base repository
   - Or use `getRepository()` to access the underlying repository when needed

3. **Add Type Annotations**:
   - Add explicit type annotations where needed to avoid implicit any types

### Phase 2: Implement Supabase Auth

1. **Update Auth Configuration**:
   - Rename `auth-supabase.ts` to `auth.ts` (replacing the current file)
   - Implement Supabase Auth with NextAuth compatibility layer

2. **Create Auth Middleware**:
   - Create a middleware that checks for Supabase Auth session
   - Implement session handling compatible with the current system

3. **Update API Routes**:
   - Update API routes to use the new auth system
   - Ensure backward compatibility with existing code

4. **Create User Management**:
   - Implement user registration, login, and profile management using Supabase Auth
   - Create UI components for auth flows

### Phase 3: Testing and Validation

1. **Test Authentication Flows**:
   - Test registration, login, logout
   - Test session persistence
   - Test protected routes

2. **Test Database Operations**:
   - Ensure all repositories work with the new auth system
   - Verify that cached repositories correctly expose all methods

3. **Performance Testing**:
   - Test connection pool settings
   - Verify caching is working correctly

## Implementation Details

### Fixing Cached Repository Method Access

The main issue is that the `CachedRepository` class doesn't expose the custom methods from the underlying repository. We need to modify the repository factory to dynamically forward all methods from the underlying repository.

```typescript
// Example implementation
export class CachedRepository<T, I, U> {
  private repository: BaseRepository<T, I, U>;
  private prefix: string;
  private defaultTtl: number;
  
  constructor(repository: BaseRepository<T, I, U>, prefix: string, defaultTtl: number) {
    this.repository = repository;
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
    
    // Forward all methods from the repository
    this.forwardMethods();
  }
  
  private forwardMethods() {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.repository))
      .filter(method => 
        method !== 'constructor' && 
        typeof this.repository[method] === 'function' &&
        !Object.getOwnPropertyNames(Object.getPrototypeOf(this)).includes(method)
      );
    
    for (const method of methods) {
      this[method] = (...args: any[]) => this.repository[method](...args);
    }
  }
  
  // Rest of the implementation...
}
```

### Implementing Supabase Auth

Supabase Auth provides a complete authentication system that can replace NextAuth. We'll need to:

1. **Configure Supabase Auth**:
   ```typescript
   // Example configuration
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

2. **Create Auth Hooks**:
   ```typescript
   // Example auth hooks
   import { useEffect, useState } from 'react';
   import { supabase } from '@/lib/supabase';
   import { User } from '@supabase/supabase-js';
   
   export function useAuth() {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         (event, session) => {
           setUser(session?.user ?? null);
           setLoading(false);
         }
       );
       
       return () => {
         subscription.unsubscribe();
       };
     }, []);
     
     return { user, loading };
   }
   ```

3. **Create Auth Components**:
   - Login form
   - Registration form
   - Password reset form
   - Profile management

4. **Update Middleware**:
   ```typescript
   // Example middleware
   import { NextRequest, NextResponse } from 'next/server';
   import { createServerClient } from '@supabase/ssr';
   
   export async function middleware(request: NextRequest) {
     const response = NextResponse.next();
     
     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       { request, response }
     );
     
     const { data: { session } } = await supabase.auth.getSession();
     
     if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
       return NextResponse.redirect(new URL('/login', request.url));
     }
     
     return response;
   }
   ```

## Next Steps

1. Fix the TypeScript errors in the repository factory
2. Update the API routes to use the fixed repositories
3. Implement Supabase Auth
4. Test the authentication flows
5. Update the documentation

This plan provides a structured approach to fixing the current issues and implementing Supabase Auth while maintaining the improvements we've already made to the database layer.