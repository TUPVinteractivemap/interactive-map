import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile'];
  
  // Check if current path is a protected routea
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Get the token from cookies (you'll need to set this when user logs in)
  const token = request.cookies.get('auth-token')?.value;
  
  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access login/register with valid token, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};