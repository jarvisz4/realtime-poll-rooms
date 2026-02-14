# Real-Time Poll Rooms - Project Summary

## Overview

A production-ready full-stack web application for creating and sharing real-time polls with anti-abuse protection.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
realtime-poll-rooms/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── poll/                 # Poll endpoints (GET, POST)
│   │   ├── vote/                 # Vote endpoint (POST)
│   │   └── ws/                   # WebSocket info endpoint
│   ├── create/                   # Poll creation page
│   ├── poll/[id]/                # Poll voting/results page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with ErrorBoundary
│   └── page.tsx                  # Home/landing page
├── components/                   # React components
│   ├── ErrorBoundary.tsx         # Error catching
│   ├── Loading.tsx               # Loading spinner
│   └── index.ts                  # Component exports
├── lib/                          # Utility functions
│   ├── db.ts                     # MongoDB connection
│   ├── useWebSocket.ts           # WebSocket React hook
│   ├── utils.ts                  # Helper functions
│   ├── vote-storage.ts           # localStorage vote tracking
│   └── websocket-server.ts       # WebSocket server logic
├── models/                       # Mongoose models
│   ├── Poll.ts                   # Poll schema
│   └── VoteRecord.ts             # Vote record (anti-abuse)
├── server/                       # Standalone WebSocket server
│   ├── websocket-server.js       # Production WS server
│   └── package.json              # Server dependencies
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
├── middleware.ts                 # Next.js middleware (CORS)
├── server.ts                     # Custom dev server with WS
├── package.json                  # Project dependencies
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Main documentation
├── DEPLOYMENT.md                 # Deployment guide
└── .env.example                  # Environment variables template
```

## Key Features Implemented

### 1. Poll Creation (/create)
- ✅ Question validation (5-500 chars)
- ✅ Minimum 2 options required
- ✅ Maximum 10 options allowed
- ✅ Sanitization to prevent XSS
- ✅ Form validation with error messages
- ✅ Loading states during submission
- ✅ Redirect to poll page after creation

### 2. Join By Link (/poll/[id])
- ✅ Dynamic route for poll access
- ✅ Fetch poll from database
- ✅ Display question and options
- ✅ Single-choice voting
- ✅ Shareable link with copy button
- ✅ Error handling for invalid IDs

### 3. Real-Time Results
- ✅ WebSocket connection for live updates
- ✅ Vote count display
- ✅ Percentage bars with animations
- ✅ Total votes counter
- ✅ Auto-reconnection on disconnect
- ✅ "Live Updates" indicator

### 4. Anti-Abuse Mechanisms

#### Mechanism 1: IP-Based Restriction
- ✅ Hash IP addresses with SHA-256 + salt
- ✅ Store in MongoDB with unique index
- ✅ Reject duplicate votes from same IP
- ✅ Handle proxy headers (X-Forwarded-For, etc.)
- ✅ Auto-cleanup old records (TTL index)

#### Mechanism 2: localStorage Tracking
- ✅ Store voted polls in browser
- ✅ Disable voting UI if already voted
- ✅ Clear error messages for duplicates
- ✅ Handle storage quota errors

### 5. Persistence
- ✅ All polls stored in MongoDB
- ✅ All votes persisted
- ✅ Data survives page refresh
- ✅ Share links work anytime

### 6. Edge Cases Handled
- ✅ Invalid poll ID format
- ✅ Poll not found (404 page)
- ✅ Duplicate vote attempts
- ✅ Less than 2 options
- ✅ Empty question
- ✅ Race conditions (atomic updates)
- ✅ Network errors
- ✅ WebSocket disconnections

### 7. UI Requirements
- ✅ Clean modern design with Tailwind CSS
- ✅ Fully responsive (mobile/desktop)
- ✅ Loading states with spinner
- ✅ Error handling with user-friendly messages
- ✅ Animated result bars
- ✅ Total votes display
- ✅ Live connection indicator

### 8. Code Quality
- ✅ Clean folder structure
- ✅ Environment variables for all secrets
- ✅ Proper error handling (try-catch)
- ✅ Production-ready structure
- ✅ Well-commented code
- ✅ TypeScript for type safety

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/poll` | Create a new poll |
| GET | `/api/poll/[id]` | Get poll by ID |
| DELETE | `/api/poll/[id]` | Delete poll (optional) |
| POST | `/api/vote` | Submit a vote |
| GET | `/api/ws` | Get WebSocket info |

## Database Schema

### Poll Collection
```javascript
{
  _id: String,           // Unique poll ID
  question: String,      // Poll question (5-500 chars)
  options: [{            // Array of options (2-10)
    id: String,          // Option ID
    text: String,        // Option text (max 200 chars)
    votes: Number        // Vote count
  }],
  totalVotes: Number,    // Total vote count
  createdAt: Date,       // Creation timestamp
  updatedAt: Date        // Last update timestamp
}
```

### VoteRecord Collection
```javascript
{
  pollId: String,        // Poll ID
  hashedIp: String,      // Hashed IP address
  votedAt: Date          // Vote timestamp (TTL: 30 days)
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app's public URL |
| `WS_URL` | No | WebSocket server URL (optional) |
| `IP_HASH_SALT` | No | Salt for IP hashing (optional) |

## Deployment Options

### Option 1: Vercel Only (No Real-Time)
- Deploy to Vercel
- Set `MONGODB_URI` and `NEXT_PUBLIC_APP_URL`
- Users refresh to see updates

### Option 2: Vercel + Separate WebSocket Server (Full Real-Time)
- Deploy WebSocket server to Railway/Render/Fly.io
- Set `WS_URL` in Vercel environment variables
- Full real-time functionality

See `DEPLOYMENT.md` for detailed instructions.

## Testing Checklist

### Poll Creation
- [ ] Create poll with valid data
- [ ] Try creating with empty question
- [ ] Try creating with 1 option
- [ ] Try creating with 11 options
- [ ] Verify redirect to poll page

### Voting
- [ ] Vote on a poll
- [ ] Try voting twice (should be blocked)
- [ ] Open in incognito (should allow vote)
- [ ] Check real-time updates (if WS configured)

### Edge Cases
- [ ] Access invalid poll ID
- [ ] Access deleted poll
- [ ] Submit vote with invalid option ID
- [ ] Disconnect internet while voting

## Known Limitations

1. **WebSocket on Vercel**: Serverless functions don't support persistent WebSockets
2. **IP Detection**: Shared networks may block legitimate users
3. **localStorage**: Can be cleared by user
4. **No Authentication**: All polls are public and anonymous

## Future Enhancements

- [ ] User authentication
- [ ] Poll expiration dates
- [ ] Multiple choice voting
- [ ] Poll results export
- [ ] Custom themes
- [ ] Poll embedding
- [ ] Analytics dashboard

## License

MIT License - See LICENSE file

## Support

For issues or questions:
1. Check README.md
2. Check DEPLOYMENT.md
3. Open an issue on GitHub
