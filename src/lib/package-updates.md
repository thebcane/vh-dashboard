# Package Updates for Supabase Auth Integration

To implement Supabase Auth, you'll need to install the following packages:

```bash
npm install @supabase/ssr @supabase/supabase-js @supabase/auth-helpers-nextjs bcryptjs
npm install --save-dev @types/bcryptjs
```

## Package Details

1. **@supabase/ssr**: Server-side rendering utilities for Supabase
   - Provides the `createServerClient` function for server components
   - Handles cookie management for authentication

2. **@supabase/supabase-js**: Supabase JavaScript client
   - Core client for interacting with Supabase services
   - Provides authentication, database, and storage functionality

3. **@supabase/auth-helpers-nextjs**: Next.js helpers for Supabase Auth
   - Provides the `createClientComponentClient` function for client components
   - Simplifies authentication in Next.js applications

4. **bcryptjs**: Password hashing library
   - Used for securely hashing passwords
   - Pure JavaScript implementation that works in all environments

5. **@types/bcryptjs**: TypeScript type definitions for bcryptjs
   - Provides type safety when using bcryptjs

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Implementation Steps

After installing these packages:

1. Update the auth system to use Supabase Auth
2. Create authentication components (login, register, etc.)
3. Update API routes to use the new auth system
4. Test the authentication flows

## Migration Strategy

To migrate from NextAuth to Supabase Auth:

1. Keep both systems running in parallel during migration
2. Gradually update components and API routes to use Supabase Auth
3. Once all components are updated, remove NextAuth

This approach ensures a smooth transition without breaking existing functionality.