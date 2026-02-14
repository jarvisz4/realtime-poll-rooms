# Real-Time Poll Rooms

A production-ready full-stack web application for creating and sharing real-time polls. Built with Next.js 14, MongoDB Atlas, and WebSockets.

## Features

- **Poll Creation**: Create polls with custom questions and multiple options
- **Real-Time Updates**: Watch votes come in instantly via WebSocket
- **Shareable Links**: Each poll gets a unique URL for easy sharing
- **Anti-Abuse Protection**: Two-layer vote prevention system
- **Responsive Design**: Works perfectly on desktop and mobile
- **Live Results**: Animated progress bars with vote counts and percentages

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB Atlas with Mongoose
- **Real-Time**: WebSockets (native ws library)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel (serverless-compatible)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd realtime-poll-rooms
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas Connection String
# Get your connection string from: https://www.mongodb.com/atlas/database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poll-rooms?retryWrites=true&w=majority

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Custom WebSocket server URL for production
# WS_URL=wss://your-websocket-server.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
realtime-poll-rooms/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── poll/                 # Poll CRUD endpoints
│   │   │   ├── route.ts          # POST /api/poll (create)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET /api/poll/[id] (fetch)
│   │   ├── vote/
│   │   │   └── route.ts          # POST /api/vote (submit vote)
│   │   └── ws/
│   │       └── route.ts          # WebSocket info endpoint
│   ├── create/
│   │   └── page.tsx              # Poll creation page
│   ├── poll/
│   │   └── [id]/
│   │       └── page.tsx          # Poll voting/results page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
├── lib/                          # Utility functions
│   ├── db.ts                     # MongoDB connection
│   ├── utils.ts                  # Helper functions
│   ├── useWebSocket.ts           # WebSocket hook
│   ├── vote-storage.ts           # Client-side vote tracking
│   └── websocket-server.ts       # WebSocket server logic
├── models/                       # Mongoose models
│   ├── Poll.ts                   # Poll schema
│   └── VoteRecord.ts             # Vote record schema (anti-abuse)
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
├── .env.example                  # Environment variables template
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Anti-Abuse Mechanisms

This application implements **two layers of protection** to ensure fair voting:

### Mechanism 1: IP-Based Vote Restriction

**How it works:**
- When a user votes, their IP address is hashed using SHA-256 with a salt
- The hashed IP + poll ID combination is stored in the database
- Before accepting a vote, the system checks if this combination already exists
- If it does, the vote is rejected with a clear error message

**Technical Details:**
- IP addresses are never stored in plain text (privacy protection)
- Uses MongoDB unique compound index to prevent race conditions
- Records auto-expire after 30 days (TTL index)
- Handles various proxy headers (`X-Forwarded-For`, `X-Real-IP`, `CF-Connecting-IP`)

**Code Location:** `models/VoteRecord.ts`, `app/api/vote/route.ts`

### Mechanism 2: Browser localStorage Tracking

**How it works:**
- After voting, the poll ID and option ID are stored in browser's localStorage
- On page load, the app checks localStorage to see if user has already voted
- If they have, the voting UI is disabled and results are shown
- Prevents accidental double-voting from the same browser

**Technical Details:**
- Stores array of vote records with timestamps
- Auto-cleans records older than 30 days
- Handles quota exceeded errors gracefully
- Provides utility functions for vote management

**Code Location:** `lib/vote-storage.ts`

### Why Both Mechanisms?

| Mechanism | Bypass Difficulty | Limitations |
|-----------|------------------|-------------|
| IP-Based | Hard (requires VPN/proxy) | Shared networks (offices, schools) |
| localStorage | Easy (clear storage/incognito) | Only affects same browser |

**Combined:** They provide reasonable protection against casual abuse while maintaining usability.

## Edge Cases Handled

### 1. Invalid Poll ID
- **Detection:** Regex validation on poll ID format
- **Response:** 400 Bad Request with clear error message
- **Location:** `lib/utils.ts:isValidPollId()`, `app/api/poll/[id]/route.ts`

### 2. Poll Not Found
- **Detection:** Database query returns null
- **Response:** 404 Not Found with user-friendly message
- **UI:** Shows "Poll Not Found" page with link to home
- **Location:** `app/poll/[id]/page.tsx`

### 3. Duplicate Vote Attempt
- **Detection:** 
  - Server: Check VoteRecord collection before accepting vote
  - Client: Check localStorage before enabling vote button
- **Response:** 403 Forbidden with "Already voted" message
- **UI:** Shows results view instead of voting buttons
- **Location:** `models/VoteRecord.ts`, `lib/vote-storage.ts`

### 4. Less Than 2 Options
- **Detection:** Validation on poll creation
- **Response:** 400 Bad Request with "At least 2 options required"
- **UI:** Form shows error message, prevents submission
- **Location:** `lib/utils.ts:validateOptions()`, `app/create/page.tsx`

### 5. Empty Question
- **Detection:** Validation on poll creation
- **Response:** 400 Bad Request with "Question is required"
- **UI:** Form shows error message
- **Location:** `lib/utils.ts:validateQuestion()`

### 6. Race Conditions During Simultaneous Votes
- **Solution:** MongoDB atomic `$inc` operator for vote increments
- **Implementation:** `findOneAndUpdate` with `$inc` operator
- **Location:** `app/api/vote/route.ts`

### 7. Network Errors
- **Handling:** Try-catch blocks on all API calls
- **UI:** Error messages with retry options
- **Fallback:** WebSocket auto-reconnection with exponential backoff
- **Location:** `lib/useWebSocket.ts`, `app/poll/[id]/page.tsx`

### 8. WebSocket Disconnection
- **Handling:** Automatic reconnection with 5 attempts
- **UI:** Shows "Connecting..." status
- **Fallback:** Page refresh will fetch latest data
- **Location:** `lib/useWebSocket.ts`

## Known Limitations

### 1. WebSocket on Vercel Serverless
**Issue:** Vercel's serverless functions don't support persistent WebSocket connections.

**Solutions:**
- **Option A:** Use a separate WebSocket server (Railway, Render, etc.)
- **Option B:** Use a managed service (Pusher, Ably)
- **Option C:** Use Server-Sent Events (SSE) instead
- **Option D:** Wait for Vercel Edge Runtime WebSocket support (experimental)

**Current Implementation:** The app works in development with native WebSockets. For production, you'll need to configure a dedicated WebSocket server and set the `WS_URL` environment variable.

### 2. IP-Based Detection Limitations
- Users on shared networks (offices, schools) share the same public IP
- VPN users can bypass IP restrictions
- Some ISPs use dynamic IPs that change frequently

### 3. localStorage Limitations
- Can be cleared by user
- Doesn't work across different browsers
- Incognito/private mode creates separate storage
- Disabled in some privacy-focused browsers

### 4. No User Authentication
- Polls are anonymous
- Anyone with the link can vote
- No way to restrict votes to specific people

## Deployment on Vercel

### Step 1: Prepare Your Repository

```bash
# Make sure your code is in a Git repository
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Set Up MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a new cluster
3. Add your IP to the whitelist
4. Create a database user
5. Get your connection string

### Step 3: Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL
4. Deploy!

### Step 4: Configure WebSocket (Optional)

For production WebSocket support:

1. Deploy a WebSocket server separately (see `server/websocket-server.js`)
2. Set `WS_URL` environment variable to your WebSocket server URL
3. Redeploy

### Environment Variables on Vercel

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poll-rooms?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
WS_URL=wss://your-websocket-server.com  # Optional
```

## API Documentation

### POST /api/poll
Create a new poll.

**Request Body:**
```json
{
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pollId": "abc123",
    "shareUrl": "https://your-app.com/poll/abc123"
  }
}
```

### GET /api/poll/[id]
Get poll data by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "abc123",
    "question": "What's your favorite color?",
    "options": [
      { "id": "opt1", "text": "Red", "votes": 5 },
      { "id": "opt2", "text": "Blue", "votes": 3 }
    ],
    "totalVotes": 8,
    "createdAt": "2024-01-01T00:00:00Z",
    "hasVoted": false
  }
}
```

### POST /api/vote
Submit a vote.

**Request Body:**
```json
{
  "pollId": "abc123",
  "optionId": "opt1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "abc123",
    "question": "What's your favorite color?",
    "options": [
      { "id": "opt1", "text": "Red", "votes": 6 },
      { "id": "opt2", "text": "Blue", "votes": 3 }
    ],
    "totalVotes": 9
  }
}
```

## WebSocket Protocol

### Client → Server Messages

**Subscribe to poll updates:**
```json
{
  "type": "SUBSCRIBE",
  "pollId": "abc123"
}
```

**Unsubscribe:**
```json
{
  "type": "UNSUBSCRIBE"
}
```

### Server → Client Messages

**Vote update:**
```json
{
  "type": "VOTE_UPDATE",
  "pollId": "abc123",
  "payload": {
    "_id": "abc123",
    "question": "What's your favorite color?",
    "options": [...],
    "totalVotes": 10
  }
}
```

**Error:**
```json
{
  "type": "ERROR",
  "error": "Invalid poll ID"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions:

1. Check the [Known Limitations](#known-limitations) section
2. Review the [Edge Cases](#edge-cases-handled) section
3. Open an issue on GitHub

---

**Built with ❤️ using Next.js, MongoDB, and WebSockets**
