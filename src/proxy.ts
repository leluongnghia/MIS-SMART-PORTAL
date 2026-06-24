import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes: Record<string, string[]> = {
  '/vi/tuyen-sinh': ['TUYEN_SINH_PR', 'BGH'],
  '/en/tuyen-sinh': ['TUYEN_SINH_PR', 'BGH'],
  '/vi/hanh-chinh': ['HANH_CHINH', 'BGH'],
  '/en/hanh-chinh': ['HANH_CHINH', 'BGH'],
  '/vi/ke-toan': ['KE_TOAN', 'BGH'],
  '/en/ke-toan': ['KE_TOAN', 'BGH'],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth checks on _next and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Get user workspace via Next.js cookies or headers in a real app, 
  // For demo, we are relying on Client-side protection or API protections.
  // Real implementation would decode JWT or read session cookie here.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
