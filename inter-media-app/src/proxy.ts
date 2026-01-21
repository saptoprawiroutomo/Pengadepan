import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  const { pathname } = request.nextUrl;

  // API routes - let them handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Public pages - allow without authentication
  if (pathname === '/login' || 
      pathname === '/register' || 
      pathname === '/' ||
      pathname.startsWith('/products') ||
      pathname.startsWith('/debug-session') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin only routes
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Kasir routes
  if (pathname.startsWith('/kasir') && !['admin', 'kasir'].includes(token.role as string)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
