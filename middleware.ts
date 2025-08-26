import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to login page and public assets
  if (path === '/admin/login') {
    return NextResponse.next();
  }

  // For all other admin routes, let client-side handle auth
  if (path.startsWith('/admin/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};