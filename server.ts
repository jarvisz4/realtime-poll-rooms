/**
 * Custom Next.js Server with WebSocket Support
 * 
 * This server is used in development to enable WebSocket functionality.
 * In production, WebSockets require a separate server (see server/websocket-server.js)
 * 
 * Usage:
 *   npm run dev (uses this server)
 * 
 * Note: This is only for development. For production, deploy to Vercel
 * and use a separate WebSocket server.
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { initializeWebSocketServer } from './lib/websocket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Create WebSocket server attached to HTTP server
  const wss = new WebSocketServer({ server });
  
  // Initialize our WebSocket handler
  initializeWebSocketServer(wss);

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
