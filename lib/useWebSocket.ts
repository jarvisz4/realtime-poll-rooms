'use client';

import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage, Poll } from '@/types';

interface UseWebSocketOptions {
  pollId: string | null;
  onVoteUpdate?: (poll: Poll) => void;
  onError?: (error: string) => void;
}

export function useWebSocket({
  pollId,
  onVoteUpdate,
  onError,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!pollId) return;

    const WS_URL =
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

    setIsConnecting(true);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setIsConnecting(false);

      // ✅ SAFE SEND (only when OPEN)
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'SUBSCRIBE',
            pollId,
          })
        );
      }
    };

    ws.onmessage = (event) => {
  console.log("WS RAW MESSAGE:", event.data);
  const message = JSON.parse(event.data);

  if (message.type === 'VOTE_UPDATE') {
    console.log("WS VOTE_UPDATE RECEIVED");
    onVoteUpdate?.(message.payload);
  }
};


    ws.onerror = () => {
      console.error('WebSocket error');
      setIsConnected(false);
      setIsConnecting(false);
      onError?.('WebSocket connection failed');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsConnecting(false);
    };

    return () => {
      if (wsRef.current) {
        // ✅ Only send if OPEN
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'UNSUBSCRIBE',
              pollId,
            })
          );
        }

        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [pollId, onVoteUpdate, onError]);

  return { isConnected, isConnecting };
}

export default useWebSocket;
