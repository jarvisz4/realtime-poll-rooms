import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage, WebSocketMessageType, Poll } from '@/types';

/**
 * WebSocket Server Module
 * 
 * This module handles real-time communication between the server and clients.
 * It broadcasts vote updates to all connected clients viewing the same poll.
 * 
 * Architecture for Vercel Serverless Compatibility:
 * - Uses a simple in-memory WebSocket server for development
 * - For production on Vercel, consider using:
 *   1. Vercel Edge Runtime with WebSockets (experimental)
 *   2. A separate WebSocket server (e.g., Pusher, Ably, or custom server)
 *   3. Server-Sent Events (SSE) as a fallback
 */

// Store active WebSocket connections grouped by poll ID
interface ClientConnection {
  ws: WebSocket;
  pollId: string | null;
  isAlive: boolean;
}

const clients = new Map<WebSocket, ClientConnection>();
let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket server
 * This should be called once when the server starts
 */
export function initializeWebSocketServer(server: WebSocketServer): void {
  wss = server;

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    // Add client to the map
    clients.set(ws, { ws, pollId: null, isAlive: true });

    // Send connected confirmation
    sendMessage(ws, {
      type: 'CONNECTED',
      payload: { message: 'Connected to poll updates' },
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        sendMessage(ws, {
          type: 'ERROR',
          error: 'Invalid message format',
        });
      }
    });

    // Handle pong (keep-alive)
    ws.on('pong', () => {
      const client = clients.get(ws);
      if (client) {
        client.isAlive = true;
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Start keep-alive interval
  startKeepAliveInterval();

  console.log('WebSocket server initialized');
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(ws: WebSocket, message: WebSocketMessage): void {
  const { type, pollId } = message;

  switch (type) {
    case 'SUBSCRIBE':
      // Client wants to receive updates for a specific poll
      if (pollId) {
        const client = clients.get(ws);
        if (client) {
          client.pollId = pollId;
          console.log(`Client subscribed to poll: ${pollId}`);
          sendMessage(ws, {
            type: 'SUBSCRIBE',
            payload: { message: `Subscribed to poll: ${pollId}` },
          });
        }
      }
      break;

    case 'UNSUBSCRIBE':
      // Client no longer wants updates
      {
        const client = clients.get(ws);
        if (client) {
          console.log(`Client unsubscribed from poll: ${client.pollId}`);
          client.pollId = null;
          sendMessage(ws, {
            type: 'UNSUBSCRIBE',
            payload: { message: 'Unsubscribed from poll updates' },
          });
        }
      }
      break;

    default:
      sendMessage(ws, {
        type: 'ERROR',
        error: `Unknown message type: ${type}`,
      });
  }
}

/**
 * Send a message to a specific WebSocket client
 */
function sendMessage(ws: WebSocket, message: WebSocketMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Broadcast a vote update to all clients subscribed to a specific poll
 * This is called after a vote is successfully recorded
 */
export function broadcastVoteUpdate(pollId: string, pollData: Poll): void {
  const message: WebSocketMessage = {
    type: 'VOTE_UPDATE',
    pollId,
    payload: pollData,
  };

  let broadcastCount = 0;

  clients.forEach((client) => {
    // Only send to clients subscribed to this poll
    if (client.pollId === pollId && client.ws.readyState === WebSocket.OPEN) {
      sendMessage(client.ws, message);
      broadcastCount++;
    }
  });

  console.log(`Broadcasted vote update to ${broadcastCount} clients for poll: ${pollId}`);
}

/**
 * Keep-alive interval to detect and remove dead connections
 */
function startKeepAliveInterval(): void {
  const interval = setInterval(() => {
    clients.forEach((client, ws) => {
      if (!client.isAlive) {
        // Connection is dead, terminate it
        ws.terminate();
        clients.delete(ws);
        return;
      }

      // Mark as potentially dead and send ping
      client.isAlive = false;
      ws.ping();
    });
  }, 30000); // Check every 30 seconds

  // Clean up interval on server close
  wss?.on('close', () => {
    clearInterval(interval);
  });
}

/**
 * Get the number of active connections
 */
export function getActiveConnectionCount(): number {
  return clients.size;
}

/**
 * Get the number of subscribers for a specific poll
 */
export function getPollSubscriberCount(pollId: string): number {
  let count = 0;
  clients.forEach((client) => {
    if (client.pollId === pollId) {
      count++;
    }
  });
  return count;
}

/**
 * Close all WebSocket connections
 * Useful for graceful shutdown
 */
export function closeAllConnections(): void {
  clients.forEach((client) => {
    client.ws.close();
  });
  clients.clear();
}
