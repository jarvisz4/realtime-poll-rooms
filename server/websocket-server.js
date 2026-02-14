console.log("Starting WebSocket server...");
const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = ['http://localhost:3000'];

const clients = new Map();

/* ===============================
   HTTP SERVER
================================= */
const server = http.createServer((req, res) => {

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      connections: clients.size
    }));
    return;
  }

  // 🔥 Broadcast endpoint (IMPORTANT)
  if (req.url === '/broadcast' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { pollId, pollData } = JSON.parse(body);
        broadcastVoteUpdate(pollId, pollData);

        res.writeHead(200);
        res.end('Broadcasted');
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });

    return;
  }

  // Default
  res.writeHead(200);
  res.end('WebSocket Server Running');
});


/* ===============================
   WEBSOCKET SERVER
================================= */
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connected');

  const clientInfo = {
    ws,
    pollId: null,
    isAlive: true,
  };

  clients.set(ws, clientInfo);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'SUBSCRIBE' && message.pollId) {
        clientInfo.pollId = message.pollId;
        console.log(`Subscribed to poll ${message.pollId}`);
      }

      if (message.type === 'UNSUBSCRIBE') {
        clientInfo.pollId = null;
      }
    } catch (err) {
      console.error('Invalid WS message');
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket disconnected');
  });
});

/* ===============================
   BROADCAST FUNCTION
================================= */
function broadcastVoteUpdate(pollId, pollData) {
  const message = JSON.stringify({
    type: 'VOTE_UPDATE',
    pollId,
    payload: pollData,
  });

  let count = 0;

  clients.forEach((client) => {
    if (
      client.pollId === pollId &&
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(message);
      count++;
    }
  });

  console.log(`Broadcasted vote update to ${count} clients`);
}

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
