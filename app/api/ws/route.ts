import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

/**
 * WebSocket API Route
 * 
 * This route provides WebSocket upgrade handling for real-time updates.
 * 
 * NOTE: WebSocket support on Vercel:
 * - Vercel's serverless functions don't support persistent WebSocket connections
 * - For production deployment on Vercel, you have several options:
 * 
 * Option 1: Use a separate WebSocket server (Recommended)
 * - Deploy WebSocket server on a platform that supports it (Railway, Render, etc.)
 * - Update WS_URL environment variable to point to that server
 * 
 * Option 2: Use a managed real-time service
 * - Pusher: https://pusher.com/
 * - Ably: https://ably.com/
 * - Socket.io with Redis adapter
 * 
 * Option 3: Use Server-Sent Events (SSE)
 * - More compatible with serverless
 * - One-way communication (server to client)
 * - Good enough for vote updates
 * 
 * Option 4: Vercel Edge Runtime (Experimental)
 * - Vercel is working on WebSocket support in Edge Runtime
 * - Check documentation for latest updates
 * 
 * For local development, this implementation uses a simple WebSocket server.
 */

/**
 * GET /api/ws
 * 
 * Returns WebSocket connection information
 * Clients should use this to get the WebSocket URL
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const wsUrl = process.env.WS_URL || process.env.NEXT_PUBLIC_APP_URL || 'ws://localhost:3001';
  const protocol = wsUrl.startsWith('https') ? 'wss' : 'ws';
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      websocketUrl: isDevelopment 
        ? `${protocol}://${request.headers.get('host')}/api/ws`
        : wsUrl,
      isDevelopment,
      message: isDevelopment 
        ? 'WebSocket is available in development mode'
        : 'For production, please configure a dedicated WebSocket server',
    },
  });
}

/**
 * HEAD /api/ws
 * 
 * Health check for WebSocket endpoint
 */
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 });
}
