
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let isAuthenticated = false;
  
  if (typeof request.cookies.has === 'function') {
    isAuthenticated = request.cookies.has('authUser');
  }

  const publicAuthRoutes = ['/login', '/signup'];

  // If user is authenticated and tries to access login or signup, redirect to dashboard
  if (isAuthenticated && publicAuthRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and tries to access protected routes (anything in /app), redirect to login
  // Travelfy application routes are protected.
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/editor') || pathname.startsWith('/posts') || pathname.startsWith('/profile');
  
  if (!isAuthenticated && isAppRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is not authenticated and accesses the root, redirect to login
   if (!isAuthenticated && pathname === '/') {
     return NextResponse.redirect(new URL('/login', request.url));
   }

   // If user is authenticated and accesses the root, redirect to dashboard
   if (isAuthenticated && pathname === '/') {
     return NextResponse.redirect(new URL('/dashboard', request.url));
   }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
