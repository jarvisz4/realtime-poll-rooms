import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * 
 * Handles CORS headers and other request preprocessing.
 * WebSocket upgrades are handled separately in development.
 */

export function middleware(request: NextRequest) {
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Allow requests from any origin in development
    // In production, restrict to your domain
    const allowedOrigin = process.env.NODE_ENV === 'development' 
      ? '*' 
      : process.env.NEXT_PUBLIC_APP_URL || '*';
    
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200 });
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
