# Deployment Guide

This guide covers deploying the Real-Time Poll Rooms application to production.

## Overview

The application consists of two parts:
1. **Next.js App** - Main web application (deployed to Vercel)
2. **WebSocket Server** - Real-time updates (deployed separately)

## Option 1: Deploy to Vercel (WebSocket Limited)

For quick deployment without real-time updates:

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/realtime-poll-rooms.git
git push -u origin main
```

### Step 2: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free account
3. Create a new cluster (M0 - Free Tier)
4. Click "Connect" → "Drivers" → "Node.js"
5. Copy the connection string
6. Replace `<password>` with your database user password

### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poll-rooms?retryWrites=true&w=majority
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```
5. Click "Deploy"

**Note:** Without a separate WebSocket server, real-time updates won't work. Users will need to refresh the page to see new votes.

---

## Option 2: Full Deployment with WebSocket (Recommended)

For full real-time functionality, deploy the WebSocket server separately.

### Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │         │  WebSocket       │
│   (Next.js)     │◄────────┤  Server          │
│                 │  HTTP   │  (Railway/etc)   │
└─────────────────┘         └──────────────────┘
         │                            ▲
         │                            │
         └────────────────────────────┘
              WebSocket Connection
```

### Step 1: Deploy WebSocket Server

#### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add a new service:
   - Click "Add a Service" → "Empty Service"
   - Name it "websocket-server"
   - Set root directory to `server/`
5. Configure environment variables:
   ```
   PORT=3001
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
   ```
6. Deploy!
7. Copy the service URL (e.g., `https://websocket-server.up.railway.app`)

#### Option B: Render

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** poll-websocket
   - **Root Directory:** `server/`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables:
   ```
   PORT=3001
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
6. Create Web Service
7. Copy the service URL

#### Option C: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Navigate to server directory
cd server/

# Launch app
fly launch --name poll-websocket

# Set secrets
fly secrets set ALLOWED_ORIGINS=https://your-vercel-app.vercel.app

# Deploy
fly deploy
```

### Step 2: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   ```
   WS_URL=wss://your-websocket-server.railway.app
   ```
   (Note: Use `wss://` for HTTPS, `ws://` for HTTP)
4. Redeploy the project

### Step 3: Verify WebSocket Connection

1. Open your deployed app
2. Create a poll
3. Open the poll in two different browsers
4. Vote in one browser
5. You should see the update in the other browser instantly!

---

## Option 3: Single-Server Deployment (Not Vercel)

If you want to deploy everything on one server (e.g., DigitalOcean, AWS EC2):

### Using Docker

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - WS_URL=ws://localhost:3001
    depends_on:
      - websocket

  websocket:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - ALLOWED_ORIGINS=${NEXT_PUBLIC_APP_URL}
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "websocket-server.js"]
```

Deploy:

```bash
# On your server
docker-compose up -d
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/poll-rooms` |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `https://myapp.vercel.app` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `WS_URL` | WebSocket server URL | Same as NEXT_PUBLIC_APP_URL |
| `IP_HASH_SALT` | Salt for IP hashing | `poll-rooms-default-salt` |
| `PORT` | Port for WebSocket server | `3001` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |

---

## Troubleshooting

### WebSocket Connection Fails

**Symptoms:** "Connecting..." never changes to "Live Updates"

**Solutions:**
1. Check browser console for errors
2. Verify `WS_URL` is correct in Vercel environment variables
3. Ensure WebSocket server is running
4. Check `ALLOWED_ORIGINS` includes your Vercel URL
5. Try using `wss://` instead of `ws://` for HTTPS

### MongoDB Connection Fails

**Symptoms:** "Failed to create poll" or "Database connection failed"

**Solutions:**
1. Verify `MONGODB_URI` is correct
2. Whitelist your IP in MongoDB Atlas
3. Check database user credentials
4. Ensure network access is configured

### Votes Not Recording

**Symptoms:** Vote button clicks but nothing happens

**Solutions:**
1. Check browser console for errors
2. Verify API routes are working: `/api/poll`, `/api/vote`
3. Check MongoDB connection
4. Look at Vercel function logs

### Duplicate Votes Allowed

**Symptoms:** Can vote multiple times from same device

**Solutions:**
1. Check if localStorage is enabled in browser
2. Verify IP-based detection is working (check VoteRecord collection)
3. Ensure MongoDB unique index is created

---

## Performance Optimization

### Database Indexes

The following indexes are automatically created:
- `polls._id` - Primary key
- `polls.createdAt` - For sorting
- `vote_records.pollId + hashedIp` - Unique compound index
- `vote_records.votedAt` - TTL index for auto-cleanup

### Caching

Consider adding:
- Redis for poll data caching
- CDN for static assets (Vercel does this automatically)
- Rate limiting on API routes

### Monitoring

Recommended tools:
- **Vercel Analytics** - Built-in performance monitoring
- **MongoDB Atlas Monitoring** - Database performance
- **Sentry** - Error tracking
- **LogRocket** - Session replay

---

## Security Checklist

- [ ] MongoDB connection uses password authentication
- [ ] IP addresses are hashed before storage
- [ ] CORS is configured for your domain only
- [ ] Environment variables are not exposed in client code
- [ ] Rate limiting is implemented on API routes
- [ ] Input validation on all user inputs
- [ ] XSS protection via input sanitization

---

## Support

For deployment issues:
1. Check logs in Vercel Dashboard
2. Check logs in Railway/Render Dashboard
3. Review MongoDB Atlas logs
4. Open an issue on GitHub
