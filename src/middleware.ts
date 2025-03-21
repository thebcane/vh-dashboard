import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Check if the user is trying to access dashboard routes
  const isDashboardRoute = path.startsWith('/dashboard');
  
  // Get the authentication cookie
  const authCookie = request.cookies.get('vh-auth')?.value;
  const isAuthenticated = authCookie === 'admin-authenticated';
  
  // If trying to access dashboard without authentication, redirect to login
  if (isDashboardRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If authenticated and trying to access login/register, redirect to dashboard
  if (isAuthenticated && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

// Apply middleware only to the following routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};