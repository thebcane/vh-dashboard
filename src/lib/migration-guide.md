# Gradual Migration to Supabase Auth

This guide outlines a more gradual approach to migrating from NextAuth to Supabase Auth without disrupting the current functionality.

## Issues with Direct Replacement

Directly replacing the existing auth files can cause several issues:

1. Breaking existing routes that depend on the current auth system
2. Disrupting the user experience during the transition
3. Making it difficult to roll back if problems occur

## Gradual Migration Approach

Instead of replacing files, we'll implement a parallel auth system that can coexist with the current one:

### Phase 1: Setup and Preparation

1. **Install Required Packages**
   ```bash
   npm install @supabase/ssr @supabase/supabase-js @supabase/auth-helpers-nextjs bcryptjs
   npm install --save-dev @types/bcryptjs
   ```

2. **Create Supabase Type Definitions**
   - Generate type definitions for your Supabase database
   - Place them in `src/types/supabase.ts`

3. **Configure Environment Variables**
   - Add Supabase environment variables to `.env.local`
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

### Phase 2: Implement Parallel Auth System

1. **Create Supabase Auth Files (with different names)**
   - `src/lib/supabase-auth.ts` (instead of replacing `auth.ts`)
   - `src/middleware-supabase.ts` (instead of replacing `middleware.ts`)

2. **Create Auth Components**
   - Implement login, register, and other auth components
   - Place them in a separate directory (e.g., `src/components/supabase-auth/`)

3. **Create Test Pages**
   - Create test pages for the new auth system (e.g., `/supabase-login`, `/supabase-register`)
   - These pages will use the new auth components but won't affect the existing ones

### Phase 3: Gradual Route Migration

1. **Create a Feature Flag System**
   - Implement a simple feature flag system to toggle between auth systems
   - This can be as simple as an environment variable (`USE_SUPABASE_AUTH=true/false`)

2. **Update API Routes One by One**
   - Modify each API route to check the feature flag
   - If the flag is on, use Supabase Auth; otherwise, use the current system
   ```typescript
   // Example API route with feature flag
   export async function GET(request: Request) {
     // Check which auth system to use
     if (process.env.USE_SUPABASE_AUTH === 'true') {
       // Use Supabase Auth
       const session = await getSupabaseSession();
       // ...
     } else {
       // Use current auth system
       const session = await auth();
       // ...
     }
     // Rest of the route logic
   }
   ```

3. **Test Each Route After Migration**
   - Verify that each route works with both auth systems
   - Fix any issues before moving to the next route

### Phase 4: User Migration

1. **Create User Migration Script**
   - Implement a script to migrate user data to Supabase Auth
   - This should include copying user credentials and metadata

2. **Implement User Migration Flow**
   - Create a flow for users to migrate their accounts
   - This can be a one-time prompt or a gradual rollout

3. **Monitor and Support**
   - Monitor the migration process
   - Provide support for users who encounter issues

### Phase 5: Complete Migration

1. **Switch Feature Flag to Supabase Auth**
   - Once all routes are migrated and tested, switch the feature flag to use Supabase Auth by default

2. **Remove Old Auth System**
   - After a stable period, remove the old auth system
   - Clean up unused code and dependencies

3. **Update Documentation**
   - Update project documentation to reflect the new auth system

## Implementation Details

### Feature Flag Implementation

```typescript
// src/lib/auth-config.ts
export const useSupabaseAuth = process.env.USE_SUPABASE_AUTH === 'true';

// Helper function to get the appropriate auth session
export async function getAuthSession() {
  if (useSupabaseAuth) {
    return getSupabaseSession();
  } else {
    return auth();
  }
}
```

### API Route Example

```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-config";

export async function GET() {
  try {
    // Get the current user session using the appropriate auth system
    const session = await getAuthSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rest of the route logic
    // ...
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}
```

### Middleware Example

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { useSupabaseAuth } from '@/lib/auth-config';
import { supabaseMiddleware } from './middleware-supabase';
import { nextAuthMiddleware } from './middleware-nextauth';

export async function middleware(request: NextRequest) {
  // Use the appropriate middleware based on the feature flag
  if (useSupabaseAuth) {
    return supabaseMiddleware(request);
  } else {
    return nextAuthMiddleware(request);
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    // Auth routes
    '/login',
    '/register',
    // API routes (except public ones)
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)',
  ],
};
```

## Benefits of Gradual Migration

1. **Reduced Risk**: Changes are isolated and can be tested independently
2. **Continuous Operation**: The system remains functional during the migration
3. **Rollback Capability**: Easy to revert to the previous system if issues arise
4. **User Experience**: Minimal disruption for users
5. **Flexibility**: Migration pace can be adjusted based on feedback and issues

This approach provides a safer path to migrating to Supabase Auth while maintaining the improvements we've made to the database layer.